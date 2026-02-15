import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://aaykisscxtsatsvnjvjo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oB8-KvMnpY6-OLhrmjgVTA_we7Zrhc_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
