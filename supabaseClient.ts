
import { createClient } from '@supabase/supabase-js';

// Project Credentials for SansarPlus
const SUPABASE_URL = 'https://mjqmhlzsblshdclnmedn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t3wclc7GUwo0AiIlDq6czw_d7dUdhZ0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
