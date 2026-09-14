// D-BATCH-1 staged parameter probe: verify fixed + runtime_date Cron body parameters.
import { withSupabase } from "npm:@supabase/server";

const PROBE_ID = "test-cron-parameter-probe";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type ProbeInput = {
  fixed_value: string;
  runtime_date: string;
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

    // This stage persists fixed_value and runtime_date exactly as supplied by Cron.
    // runtime_time remains a server-side control until the final probe stage.
    const { error } = await supabaseAdmin.from("test_p7k2m4").insert({
      created_by: "-1",
      fixed_value: validation.input.fixed_value,
      runtime_date: validation.input.runtime_date,
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
      mode: "fixed-value-plus-runtime-date",
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
  const runtimeDate = body.runtime_date;
  const errors: string[] = [];

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

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      fixed_value: fixedValue as string,
      runtime_date: runtimeDate as string,
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
