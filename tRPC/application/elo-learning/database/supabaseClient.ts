import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// ✅ No need to declare __dirname manually — it's already available
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseKey: string | undefined = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_KEY must be defined',
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
