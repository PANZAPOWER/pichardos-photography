export async function onRequestPost({ request, env }) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  let body;
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries(fd.entries());
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Bad request" }), { status: 400, headers });
  }

  // Honeypot check
  if (body._honey) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  // Basic validation
  if (!body.name || !body.email) {
    return new Response(JSON.stringify({ ok: false, error: "Name and email required" }), { status: 422, headers });
  }

  // Try Supabase if configured
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          name: body.name,
          email: body.email,
          phone: body.phone || null,
          service: body.service || null,
          event_date: body.event_date || null,
          city: body.city || null,
          message: body.message || null,
          source: "website_contact_form",
          created_at: new Date().toISOString()
        })
      });

      if (!res.ok) {
        console.error("Supabase error:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Supabase request failed:", err);
    }
  }

  // Always redirect to thank-you (fail-soft)
  return new Response(null, {
    status: 303,
    headers: { ...headers, Location: "/thank-you/" }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
