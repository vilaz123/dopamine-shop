import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 单例 Supabase 客户端。
 *
 * 静态导出（output: "export"）部署到 GitHub Pages，没有服务端，
 * 因此 anon key 会打进静态产物 —— 安全完全依赖 RLS。
 *
 * env 缺失（未配置 NEXT_PUBLIC_SUPABASE_*）时返回 null，
 * 应用自动降级为纯本地模式，不崩溃。
 */
let client: SupabaseClient | null = null;
let initialized = false;

export function getSupabase(): SupabaseClient | null {
  if (initialized) return client;
  initialized = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    client = null;
    return null;
  }

  try {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch {
    client = null;
  }
  return client;
}

/** 是否已配置云端（用于 UI 决定走真实鉴权还是本地降级）。 */
export function isCloudEnabled(): boolean {
  return getSupabase() !== null;
}
