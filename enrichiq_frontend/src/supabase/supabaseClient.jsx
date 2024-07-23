// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ffeidpqtsfxmedbgxleq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWlkcHF0c2Z4bWVkYmd4bGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ5MTc1MzYsImV4cCI6MjAzMDQ5MzUzNn0.ExTDw7zi8uzmTaSBFwM0ueI4mL_tb46IN5pbnDZoz-o";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
  },
});

export default supabase;