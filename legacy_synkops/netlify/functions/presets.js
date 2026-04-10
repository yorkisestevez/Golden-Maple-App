export default async function handler(req, context) {
  try {
    // TEMP: no database yet — return safe empty response
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ presets: [] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
