// Playground batch/scheduling probe: process synthetic PENDING rows through
// Supabase Native Data API calls and one minimal Open-Meteo request per row.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const WORKER_ID = "test-cron-edge-worker";

type PendingRow = { t01: number; t02: number };
type RowResult = { oid: number; status: "SUCCESS" | "FAILED"; reason?: string };

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed", allowed: "POST" }, 405, {
      allow: "POST",
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = Deno.env.get("SB_SECRET_KEY");
  if (!supabaseUrl || !secretKey) {
    return jsonResponse(
      {
        error: "runtime_configuration_error",
        message: "Required managed Supabase configuration is unavailable.",
      },
      500,
    );
  }

  const apiKey = request.headers.get("apikey");
  if (!apiKey) {
    return jsonResponse(
      {
        error: "missing_api_key",
        message: "apikey header is required.",
      },
      401,
    );
  }

  // Gateway JWT verification is disabled for this function because Supabase Secret
  // Keys are not JWTs. This check is therefore the worker's authorization boundary
  // and must remain before createClient() and every Native Data API operation.
  if (apiKey !== secretKey) {
    return jsonResponse(
      {
        error: "forbidden",
        message: "Server-side worker authorization is required.",
      },
      403,
    );
  }

  // createClient.from() uses the Supabase Native Data API. This worker intentionally
  // does not use direct SQL, RPC, or a database function for either table.
  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("test_b8c3q1")
    .select("t01,t02")
    .eq("t03", "PENDING")
    .order("t01", { ascending: true });

  if (error) {
    return jsonResponse(
      { error: "pending_select_failed", detail: error.message },
      500,
    );
  }

  const results: RowResult[] = [];
  for (const row of (data ?? []) as PendingRow[]) {
    results.push(await processRow(supabase, row));
  }

  return jsonResponse({
    worker: WORKER_ID,
    pending_count: data?.length ?? 0,
    success_count: results.filter((result) => result.status === "SUCCESS")
      .length,
    failed_count: results.filter((result) => result.status === "FAILED").length,
    results,
  });
});

async function processRow(
  supabase: SupabaseClient,
  row: PendingRow,
): Promise<RowResult> {
  try {
    const { data: place, error } = await supabase
      .from("place")
      .select("oid,latitude,longitude")
      .eq("oid", row.t02)
      .maybeSingle();

    if (error) throw new Error(`place_select_failed: ${error.message}`);
    if (place?.latitude == null || place?.longitude == null) {
      return await markFailed(supabase, row.t01, "coordinates_unavailable");
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
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
      })
      .eq("t01", row.t01)
      .eq("t03", "PENDING");

    if (updateError)
      throw new Error(`success_update_failed: ${updateError.message}`);
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
  const { error } = await supabase
    .from("test_b8c3q1")
    .update({ t03: "FAILED", t07: new Date().toISOString(), t08: WORKER_ID })
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
