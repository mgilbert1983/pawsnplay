// Public settings only. The anon/publishable key is designed to be public;
// it is safe ONLY because the database security rules (01_schema.sql) are in place.
// NEVER put the secret (service_role) key, a database password or any token in this file.
window.PNP_CONFIG = {
  SUPABASE_URL: "https://ukodvggmupifvkqvkfze.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_s0nMYuRkY3F5gdvBOtlSoA_c8anx-G6"
};
