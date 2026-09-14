// D-BATCH-1 staged parameter probe: verify one fixed Cron body parameter first.
import { withSupabase } from "npm:@supabase/server";

const PROBE_ID = "test-cron-parameter-probe";

type ProbeInput = {
  fixed_value: string;
};

Deno.serve(
  // Match the already-working Cron Edge worker auth mode exactly.
  withSupabase({ auth: "secret" })(async (request, { supabaseAdmin }) => {
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "method_not_allowed", allowed: "POST" },
        405,
        { allow: "POST" },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "invalid_json" }, 400);
    }

    const validation = validateInput(body);
    if (!validation.ok) {
      return jsonResponse(
        { error: "invalid_parameters", details: validation.errors },
        400,
      );
    }

    const now = new Date();
    const runtimeDate = new Date(now.getTime() - 86_400_000)
      .toISOString()
      .slice(0, 10);

    // This stage persists the caller-supplied fixed value only.
    // Date/time remain synthetic server-side controls until later probe stages.
    const { error } = await supabaseAdmin.from("test_p7k2m4").insert({
      created_by: "-1",
      fixed_value: validation.input.fixed_value,
      runtime_date: runtimeDate,
      runtime_time: now.toISOString().slice(11),
    });

    if (error) {
      return jsonResponse(
        { error: "insert_failed", detail: error.message },
        500,
      );
    }

    return jsonResponse({
      probe: PROBE_ID,
      mode: "fixed-value-only",
      inserted: true,
      received: validation.input,
    });
  }),
);

function validateInput(
  value: unknown,
): { ok: true; input: ProbeInput } | { ok: false; errors: string[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, errors: ["body_must_be_object"] };
  }

  const body = value as Record<string, unknown>;
  const fixedValue = body.fixed_value;

  if (typeof fixedValue !== "string" || fixedValue.trim() === "") {
    return { ok: false, errors: ["fixed_value_required"] };
  }

  return {
    ok: true,
    input: { fixed_value: fixedValue },
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
