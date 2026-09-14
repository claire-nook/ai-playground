// D-BATCH-1 parameterized invocation probe: persist only values supplied by the caller.
import { withSupabase } from "npm:@supabase/server";

const PROBE_ID = "test-cron-parameter-probe";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}(?::?\d{2})?)$/;

type ProbeInput = {
  fixed_value: string;
  runtime_date: string;
  runtime_time: string;
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

    const input = validation.input;

    // Critical experiment boundary: runtime_date/runtime_time are persisted exactly
    // as received. This function must not calculate replacement runtime values.
    const { error } = await supabaseAdmin.from("test_p7k2m4").insert({
      created_by: "-1",
      fixed_value: input.fixed_value,
      runtime_date: input.runtime_date,
      runtime_time: input.runtime_time,
    });

    if (error) {
      return jsonResponse(
        { error: "insert_failed", detail: error.message },
        500,
      );
    }

    // service_role intentionally has INSERT-only access on this probe table.
    // Echo the accepted payload instead of adding SELECT privilege merely to decorate a response.
    return jsonResponse({
      probe: PROBE_ID,
      inserted: true,
      received: input,
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
  const errors: string[] = [];
  const fixedValue = body.fixed_value;
  const runtimeDate = body.runtime_date;
  const runtimeTime = body.runtime_time;

  if (typeof fixedValue !== "string" || fixedValue.trim() === "") {
    errors.push("fixed_value_required");
  }
  if (
    typeof runtimeDate !== "string" ||
    !DATE_PATTERN.test(runtimeDate) ||
    Number.isNaN(Date.parse(`${runtimeDate}T00:00:00Z`))
  ) {
    errors.push("runtime_date_invalid");
  }
  if (typeof runtimeTime !== "string" || !TIME_PATTERN.test(runtimeTime)) {
    errors.push("runtime_time_invalid");
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    input: {
      fixed_value: fixedValue as string,
      runtime_date: runtimeDate as string,
      runtime_time: runtimeTime as string,
    },
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
