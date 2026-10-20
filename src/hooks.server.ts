type HookEvent = {
  request: Request;
  url: URL;
};

type HookInput = {
  event: HookEvent;
  resolve: (event: HookEvent) => Promise<Response>;
};

export const handle = async ({ event, resolve }: HookInput): Promise<Response> => {
  const response = await resolve(event);

  const acceptsHtml = event.request.headers.get("accept")?.includes("text/html");
  if (!acceptsHtml || !["GET", "HEAD"].includes(event.request.method)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  headers.delete("etag");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
