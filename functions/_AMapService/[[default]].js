const PREFIX = "/_AMapService";

function plain(message, status = 200) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return plain("Method Not Allowed", 405);
  }

  if (!env.AMAP_SECURITY_CODE) {
    return plain("Missing AMAP_SECURITY_CODE", 500);
  }

  const incoming = new URL(request.url);
  if (!incoming.pathname.startsWith(`${PREFIX}/`)) {
    return plain("Not Found", 404);
  }

  // Reject browser requests initiated by another website. The Web Key must
  // additionally be bound to the final EdgeOne hostname in the AMap console.
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return plain("Forbidden", 403);
  }

  const referer = request.headers.get("Referer");
  if (referer && new URL(referer).host !== incoming.host) {
    return plain("Forbidden", 403);
  }

  const targetPath = incoming.pathname.slice(PREFIX.length);
  const upstream = targetPath.startsWith("/v4/map/styles")
    ? "https://webapi.amap.com"
    : "https://restapi.amap.com";
  const target = new URL(targetPath, upstream);

  for (const [name, value] of incoming.searchParams) {
    target.searchParams.append(name, value);
  }
  target.searchParams.set("jscode", env.AMAP_SECURITY_CODE);

  const upstreamResponse = await fetch(target, {
    method: request.method,
    headers: {
      Accept: request.headers.get("Accept") || "*/*",
    },
  });

  const headers = new Headers(upstreamResponse.headers);
  headers.delete("Set-Cookie");
  headers.set("Cache-Control", "no-store");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}
