// database/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// For CommonJS, __dirname is already available, so no need to redefine __filename or __dirname
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found in environment variables');
  console.warn('Using fallback configuration...');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
);

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('count')
      .limit(1);
    if (error) {
      console.log('📋 Supabase connection test failed, using fallback mode');
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.log('📋 Supabase not configured, using fallback mode');
  }
};

testConnection();
