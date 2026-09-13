// Netlify Functions sibling probe for the verified Supabase C-0 deployment experiment.
// Intentionally excludes Database, Auth, CORS, and business logic so this experiment
// isolates the iPad-first source -> Git -> Netlify deployment path.
export default async () => {
  const body = {
    message: "Hello from Netlify Functions",
    runtime: "Netlify Functions",
    experiment: "C-NF-0",
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
};
