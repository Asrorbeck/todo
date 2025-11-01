import { createClient } from "@supabase/supabase-js";

// Fallback to hardcoded values if env vars are not loaded
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://bqizqxcvioeypuljlrni.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaXpxeGN2aW9leXB1bGpscm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTc1NzYsImV4cCI6MjA3NzQ5MzU3Nn0.nmjg7-TAABAGkrlaOapjV4k-AiPAz7jjJv_enC-Xnvw";

console.log("Supabase initialized:", {
  urlLoaded: !!import.meta.env.VITE_SUPABASE_URL,
  keyLoaded: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  usingFallback: !import.meta.env.VITE_SUPABASE_URL,
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
