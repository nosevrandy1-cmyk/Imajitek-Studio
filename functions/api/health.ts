import type { PagesFunction, Response as CFResponse } from "@cloudflare/workers-types";

export function handleHealthRequest(request: Request): Response {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(
      JSON.stringify({ ok: false, error: "METHOD_NOT_ALLOWED", message: "Gunakan metode GET." }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Allow: "GET, HEAD",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      service: "imajitek-studio-edge",
      runtime: "cloudflare-pages-functions",
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

export const onRequest: PagesFunction = async (context) => {
  return handleHealthRequest(context.request as unknown as Request) as unknown as CFResponse;
};
