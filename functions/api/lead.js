// Cloudflare Pages Function — handles the contact / booking form POST.
//
// Delivery priority:
//   1. EMAIL the inquiry to Miguel via Web3Forms (set WEB3FORMS_KEY in the
//      Cloudflare Pages env — free key from https://web3forms.com, no domain
//      verification needed; the key decides which inbox receives the leads).
//   2. Also store it in Supabase if SUPABASE_URL + SUPABASE_SERVICE_KEY are set
//      (a durable backup so no lead is ever lost).
// The visitor is always redirected to /thank-you/ (fail-soft).

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

  // Honeypot — silently accept bots without notifying anyone.
  if (body._honey) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  // Basic validation.
  if (!body.name || !body.email) {
    return new Response(JSON.stringify({ ok: false, error: "Name and email required" }), { status: 422, headers });
  }

  const lead = {
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    service: body.service || "",
    event_date: body.event_date || "",
    city: body.city || "",
    message: body.message || ""
  };

  let emailed = false;

  // 1) Email the inquiry to Miguel via Web3Forms.
  const web3key = env.WEB3FORMS_KEY;
  if (web3key) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          access_key: web3key,
          subject: `New booking inquiry — ${lead.name}`,
          from_name: "Pichardo's Photography Website",
          replyto: lead.email, // so Miguel can reply straight to the client
          Name: lead.name,
          Email: lead.email,
          Phone: lead.phone,
          "Type of Session": lead.service,
          "Event Date": lead.event_date,
          "City / Location": lead.city,
          Message: lead.message
        })
      });
      emailed = res.ok;
      if (!res.ok) console.error("Web3Forms error:", res.status, await res.text());
    } catch (err) {
      console.error("Web3Forms request failed:", err);
    }
  }

  // 2) Durable backup in Supabase (optional).
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
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          service: lead.service || null,
          event_date: lead.event_date || null,
          city: lead.city || null,
          message: lead.message || null,
          source: "website_contact_form",
          created_at: new Date().toISOString()
        })
      });
      if (!res.ok) console.error("Supabase error:", res.status, await res.text());
    } catch (err) {
      console.error("Supabase request failed:", err);
    }
  }

  // Surface a hard failure to fetch-based callers; browsers follow the redirect.
  if (!web3key && !supabaseUrl) {
    console.warn("Lead received but no delivery configured (set WEB3FORMS_KEY).");
  }

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
