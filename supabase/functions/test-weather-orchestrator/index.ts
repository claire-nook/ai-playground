// Experiment: Custom API orchestration probe.
// Flow: caller JWT -> test-place-country -> caller-scoped valid places -> Open-Meteo.
// This function never accesses the database directly and forwards the caller's
// Authorization header unchanged to preserve the downstream RLS boundary.
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "GET, OPTIONS",
};

const WEATHER_FIELDS = [
  "temperature_2m_min",
  "temperature_2m_max",
  "precipitation_sum",
  "weather_code",
  "sunrise",
  "sunset",
  "daylight_duration",
] as const;

type Place = {
  place_code?: string | null;
  place_name?: string | null;
  country_code?: string | null;
  country_name?: string | null;
  country_name_en?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "GET") {
    return jsonResponse(
      { error: "method_not_allowed", message: "Use GET for this experiment." },
      405,
      { allow: "GET, OPTIONS" },
    );
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse(
      { error: "missing_authorization", message: "Authorization header is required." },
      401,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) {
    return jsonResponse(
      {
        error: "runtime_configuration_error",
        message: "Supabase runtime environment is missing required configuration.",
      },
      500,
    );
  }

  const validPlaceEndpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/test-place-country`;
  let validPlaceResponse: Response;

  try {
    validPlaceResponse = await fetch(validPlaceEndpoint, {
      method: "GET",
      // Forward exactly the caller-provided value; do not substitute privileged credentials.
      headers: { Authorization: authorization },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "valid_place_api_unreachable",
        message: "The valid-place API request could not be completed.",
        detail: safeErrorMessage(error),
      },
      502,
    );
  }

  const validPlaceText = await validPlaceResponse.text();
  const validPlaceBody = parseJson(validPlaceText);

  if (!validPlaceResponse.ok) {
    return jsonResponse(
      {
        error: "valid_place_api_failed",
        message: "The valid-place API returned a non-success response.",
        valid_place_api_status: validPlaceResponse.status,
        downstream_error: safeDownstreamError(validPlaceBody),
      },
      502,
    );
  }

  if (!validPlaceBody || !Array.isArray(validPlaceBody.rows)) {
    return jsonResponse(
      {
        error: "invalid_valid_place_response",
        message: "The valid-place API response did not contain a rows array.",
        valid_place_api_status: validPlaceResponse.status,
      },
      502,
    );
  }

  const places = validPlaceBody.rows as Place[];
  // This early return is intentional evidence that zero visible places creates no provider fan-out.
  if (places.length === 0) {
    return jsonResponse({
      experiment: "custom-api-orchestration",
      valid_place_api_status: validPlaceResponse.status,
      place_count: 0,
      weather_success_count: 0,
      weather_failure_count: 0,
      rows: [],
    });
  }

  // Each promise catches and represents its own failure so one provider error cannot erase peers.
  const rows = await Promise.all(places.map(fetchWeatherForPlace));
  const weatherSuccessCount = rows.filter((row) => row.ok).length;

  return jsonResponse({
    experiment: "custom-api-orchestration",
    valid_place_api_status: validPlaceResponse.status,
    place_count: places.length,
    weather_success_count: weatherSuccessCount,
    weather_failure_count: rows.length - weatherSuccessCount,
    rows,
  });
});

async function fetchWeatherForPlace(place: Place) {
  const identity = {
    place_code: place.place_code ?? null,
    place_name: place.place_name ?? null,
    country_code: place.country_code ?? null,
    country_name: place.country_name ?? null,
    country_name_en: place.country_name_en ?? null,
  };
  const latitude = place.latitude;
  const longitude = place.longitude;

  if (
    typeof latitude !== "number" || !Number.isFinite(latitude) ||
    typeof longitude !== "number" || !Number.isFinite(longitude)
  ) {
    return {
      ...identity,
      ok: false,
      provider_status: null,
      timezone: place.timezone ?? null,
      error: "invalid_place_coordinates",
      message: "Valid numeric latitude and longitude are required.",
    };
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    past_days: "1",
    forecast_days: "0",
    timezone: "auto",
    daily: WEATHER_FIELDS.join(","),
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    const text = await response.text();
    const body = parseJson(text);

    if (!response.ok) {
      return {
        ...identity,
        ok: false,
        provider_status: response.status,
        timezone: place.timezone ?? null,
        error: "weather_provider_failed",
        message: safeDownstreamError(body),
      };
    }

    if (!body || typeof body !== "object" || !body.daily || !Array.isArray(body.daily.time)) {
      return {
        ...identity,
        ok: false,
        provider_status: response.status,
        timezone: typeof body?.timezone === "string" ? body.timezone : place.timezone ?? null,
        error: "invalid_weather_response",
        message: "Open-Meteo response did not contain the expected daily arrays.",
      };
    }

    return {
      ...identity,
      ok: true,
      provider_status: response.status,
      timezone: typeof body.timezone === "string" ? body.timezone : place.timezone ?? null,
      weather: {
        weather_date: body.daily.time[0] ?? null,
        temperature_2m_min: body.daily.temperature_2m_min?.[0] ?? null,
        temperature_2m_max: body.daily.temperature_2m_max?.[0] ?? null,
        precipitation_sum: body.daily.precipitation_sum?.[0] ?? null,
        weather_code: body.daily.weather_code?.[0] ?? null,
        sunrise: body.daily.sunrise?.[0] ?? null,
        sunset: body.daily.sunset?.[0] ?? null,
        daylight_duration: body.daily.daylight_duration?.[0] ?? null,
      },
    };
  } catch (error) {
    return {
      ...identity,
      ok: false,
      provider_status: null,
      timezone: place.timezone ?? null,
      error: "weather_provider_unreachable",
      message: safeErrorMessage(error),
    };
  }
}

function parseJson(text: string): any {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function safeDownstreamError(body: any): string {
  if (!body || typeof body !== "object") return "Downstream response did not contain JSON error details.";
  for (const value of [body.error, body.reason, body.message]) {
    if (typeof value === "string" && value.trim()) return value.slice(0, 300);
  }
  return "Downstream response did not contain safe error details.";
}

function safeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 300) : "Unknown request error.";
}

function jsonResponse(body: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}
