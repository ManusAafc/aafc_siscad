// Chaves públicas do Supabase (seguras no client-side)
export const ENV = {
  SUPABASE_URL: (import.meta.env.SUPABASE_URL as string) || '',
  SUPABASE_ANON_KEY: (import.meta.env.SUPABASE_ANON_KEY as string) || '',
  SUPABASE_STORAGE_URL: (import.meta.env.SUPABASE_STORAGE_URL as string) || '',
  SUPABASE_BUCKET_NAME: (import.meta.env.SUPABASE_BUCKET_NAME as string) || '',
};

// Chaves sensíveis devem ser acessadas via proxy backend (Supabase Edge Functions)
// NUNCA exponha no client-side: JS_REPORT_*, EVO_API_*, N8N_WEBHOOK_*
