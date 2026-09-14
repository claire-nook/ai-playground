// Playground batch/scheduling probe: process synthetic PENDING rows and call Open-Meteo.
import { withSupabase } from "npm:@supabase/server";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const WORKER_ID = "test-cron-edge-worker";
const PENDING_ROW_LIMIT = 3;

type PendingRow = {
  t01: number;
  latitude: number | null;
  longitude: number | null;
};

type RowResult = {
  oid: number;
  status: "SUCCESS" | "FAILED";
  reason?: string;
};

Deno.serve(
  withSupabase({ auth: "secret" })(async (request, { supabaseAdmin }) => {
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "method_not_allowed", allowed: "POST" },
        405,
        { allow: "POST" },
      );
    }

    // Read only the synthetic inputs needed by this scheduling probe.
    const { data, error } = await supabaseAdmin
      .from("test_b8c3q1")
      .select("t01,latitude,longitude")
      .eq("t03", "PENDING")
      .order("t01", { ascending: true })
      .limit(PENDING_ROW_LIMIT);

    if (error) {
      return jsonResponse(
        { error: "pending_select_failed", detail: error.message },
        500,
      );
    }

    const results: RowResult[] = [];
    for (const row of (data ?? []) as PendingRow[]) {
      results.push(await processRow(supabaseAdmin, row));
    }

    return jsonResponse({
      worker: WORKER_ID,
      pending_count: data?.length ?? 0,
      pending_row_limit: PENDING_ROW_LIMIT,
      success_count: results.filter((result) => result.status === "SUCCESS")
        .length,
      failed_count: results.filter((result) => result.status === "FAILED").length,
      results,
    });
  }),
);

async function processRow(
  supabase: SupabaseClient,
  row: PendingRow,
): Promise<RowResult> {
  try {
    // Formal place lookup is intentionally deferred; synthetic coordinates
    // isolate the scheduled outbound HTTP path for this experiment.
    if (row.latitude == null || row.longitude == null) {
      return await markFailed(supabase, row.t01, "coordinates_unavailable");
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(row.latitude),
      longitude: String(row.longitude),
      current: "temperature_2m",
      forecast_days: "1",
    }).toString();

    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error(`weather_http_${response.status}`);

    const weather = await response.json();
    const temperature = weather?.current?.temperature_2m;
    if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
      throw new Error("weather_temperature_unavailable");
    }

    const { error: updateError } = await supabase
      .from("test_b8c3q1")
      .update({
        t03: "SUCCESS",
        t04: temperature,
        t07: new Date().toISOString(),
        t08: WORKER_ID,
        t09: null,
      })
      .eq("t01", row.t01)
      .eq("t03", "PENDING");

    if (updateError) {
      throw new Error(`success_update_failed: ${updateError.message}`);
    }

    return { oid: row.t01, status: "SUCCESS" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown_row_error";
    return await markFailed(supabase, row.t01, reason);
  }
}

async function markFailed(
  supabase: SupabaseClient,
  oid: number,
  reason: string,
): Promise<RowResult> {
  // Persist row-level failure reason for direct observation in the test UI.
  const { error } = await supabase
    .from("test_b8c3q1")
    .update({
      t03: "FAILED",
      t07: new Date().toISOString(),
      t08: WORKER_ID,
      t09: reason,
    })
    .eq("t01", oid)
    .eq("t03", "PENDING");

  return {
    oid,
    status: "FAILED",
    reason: error
      ? `${reason}; failed_update_failed: ${error.message}`
      : reason,
  };
}

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}
