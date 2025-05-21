import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual project details
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const { data, error } = await supabase
    .from('Users')
    .select('id,name,surname,username,email,currentLevel,joinDate,xp');

  if (error) {
    console.error('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful! Sample data:', data);
  }
}

testConnection();
