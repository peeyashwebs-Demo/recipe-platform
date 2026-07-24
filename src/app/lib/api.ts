import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// Singleton browser client — used for auth only (data goes through the server).
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4fda6252`;

async function authHeader(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return publicAnonKey;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? publicAnonKey;
  } catch {
    return publicAnonKey;
  }
}

export async function api<T = any>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const token = opts.auth ? await authHeader() : publicAnonKey;
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const message = json?.error ?? `Request to ${path} failed with ${res.status}`;
    console.error(`API error [${path}]:`, message);
    throw new Error(message);
  }
  return json as T;
}
