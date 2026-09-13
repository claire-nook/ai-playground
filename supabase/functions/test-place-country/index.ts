// Experiment: Database-centric Custom API probe.
// Flow: caller JWT -> RPC -> RLS -> Native Data API -> application-side mapping.
// This function deliberately uses the caller's Authorization header instead of
// service_role so the experiment can observe existing RLS/Application Access behavior.
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (request: Request) => {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return jsonResponse(
      {
        error: "missing_authorization",
        message: "Authorization header is required.",
      },
      401,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(
      {
        error: "runtime_configuration_error",
        message: "Supabase runtime environment is missing required configuration.",
      },
      500,
    );
  }

  // Forward the caller JWT so RPC and table reads execute under the same caller context.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  // Step 1: call the PostgreSQL Function through Supabase RPC.
  const { data: places, error: placesError } = await supabase.rpc(
    "test_get_valid_places",
  );

  if (placesError) {
    return jsonResponse(
      {
        error: "rpc_failed",
        detail: placesError,
      },
      500,
    );
  }

  const placeRows = places ?? [];
  const countryCodes = [
    ...new Set(
      placeRows
        .map((place: { country_code?: string | null }) => place.country_code)
        .filter((code): code is string => Boolean(code)),
    ),
  ];

  // Step 2: query country through the Native Data API in one batch.
  let countries: Array<{
    country_code: string;
    country_name: string;
    country_name_en: string;
  }> = [];

  if (countryCodes.length > 0) {
    const { data: countryRows, error: countriesError } = await supabase
      .from("country")
      .select("country_code,country_name,country_name_en")
      .in("country_code", countryCodes)
      .eq("is_active", true);

    if (countriesError) {
      return jsonResponse(
        {
          error: "country_query_failed",
          detail: countriesError,
        },
        500,
      );
    }

    countries = countryRows ?? [];
  }

  // Step 3: application-side mapping, intentionally kept outside PostgreSQL for this probe.
  const countryByCode = new Map(
    countries.map((country) => [country.country_code, country]),
  );

  const result = placeRows.map(
    (place: {
      oid: number;
      place_code: string;
      place_name: string;
      country_code: string;
    }) => {
      const country = countryByCode.get(place.country_code);

      return {
        oid: place.oid,
        place_code: place.place_code,
        place_name: place.place_name,
        country_code: place.country_code,
        country_name: country?.country_name ?? null,
        country_name_en: country?.country_name_en ?? null,
      };
    },
  );

  return jsonResponse({
    experiment: "database-centric-custom-api",
    rpc_row_count: placeRows.length,
    country_row_count: countries.length,
    rows: result,
  });
});

// Keep response construction consistent and explicit for experiment evidence.
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
