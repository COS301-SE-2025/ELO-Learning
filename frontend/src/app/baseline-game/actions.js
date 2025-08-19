'use server';

import { redirect } from 'next/navigation';
import { updateUserElo } from '@/services/api';

export async function handleBaselineComplete(userId, finalElo) {
  try {
    // Update user's ELO rating and baseline test status
    await updateUserElo(userId, finalElo);

    // Redirect to end screen with baseline mode and elo rating
    redirect(`/end-screen?mode=baseline&elo=${finalElo}`);
  } catch (error) {
    console.error('Failed to complete baseline test:', error);
    redirect('/dashboard?error=baseline-completion-failed');
  }
}
