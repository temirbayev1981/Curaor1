/** Shared auth for Supabase Edge Functions — reject unauthenticated callers. */

export function verifyEdgeRequest(req: Request): boolean {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;

  const token = auth.slice(7);
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const edgeSecret = Deno.env.get('EDGE_FUNCTION_SECRET');

  if (serviceKey && token === serviceKey) return true;
  if (edgeSecret && token === edgeSecret) return true;

  return false;
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
