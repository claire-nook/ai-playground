// Experiment C-0: minimal Supabase Edge Function deployed by GitHub Actions.
// This endpoint intentionally avoids Database, Auth, and business logic so the
// experiment can isolate the deployment path itself.
Deno.serve((_request: Request) => {
  const body = {
    message: "Hello from GitHub Actions",
    runtime: "Supabase Edge Function",
    experiment: "C-0",
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
});
