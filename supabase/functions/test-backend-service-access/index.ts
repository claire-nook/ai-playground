// C-BSA-1 Phase A-1 baseline probe.
// Flow: Edge Function backend service identity -> Native Data API -> synthetic table SELECT.
import { withSupabase } from "npm:@supabase/server";

const PROBE_ID = "C-BSA-1-A1";

Deno.serve(
  // Internal backend endpoint: require a Supabase secret API key.
  withSupabase({ auth: "secret" })(async (request, { supabaseAdmin }) => {
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "method_not_allowed", allowed: "POST" },
        405,
        { allow: "POST" },
      );
    }

    // A-1 deliberately performs only SELECT. Later phases change privileges
    // one dimension at a time so object privilege and RLS stay separable.
    const { data, error } = await supabaseAdmin
      .from("test_bsa_access")
      .select("oid,test_key,test_value,created_at")
      .order("oid", { ascending: true });

    if (error) {
      return jsonResponse(
        {
          experiment: PROBE_ID,
          success: false,
          error: "baseline_select_failed",
          detail: error.message,
        },
        500,
      );
    }

    return jsonResponse({
      experiment: PROBE_ID,
      success: true,
      row_count: data?.length ?? 0,
      rows: data ?? [],
    });
  }),
);

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
