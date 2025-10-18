#!/usr/bin/env node
import bcrypt from 'bcrypt';
import readline from 'readline';
import { supabase } from '../database/supabaseClient.js';

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node src/admin-set-password.js <email> <newPassword>');
    process.exit(1);
  }

  const [email, newPassword] = args;

  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  // Find users matching email (case-insensitive)
  const { data: users, error: fetchError } = await supabase
    .from('Users')
    .select('*')
    .ilike('email', email);

  if (fetchError) {
    console.error('Error fetching user:', fetchError.message || fetchError);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error('No users found with email like:', email);
    process.exit(1);
  }

  console.log(`Found ${users.length} user(s):`);
  users.forEach((u, idx) =>
    console.log(
      `${idx + 1}. id=${u.id} email=${u.email} username=${u.username}`,
    ),
  );

  if (users.length > 1) {
    const ans = await prompt(
      'Multiple users found. Continue and update ALL matching users? (yes/no): ',
    );
    if (ans.trim().toLowerCase() !== 'yes') {
      console.log('Aborted');
      process.exit(0);
    }
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from('Users')
    .update({ password: hashed })
    .ilike('email', email);

  if (updateError) {
    console.error(
      'Error updating password:',
      updateError.message || updateError,
    );
    process.exit(1);
  }

  console.log('Password updated for matching user(s).');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
