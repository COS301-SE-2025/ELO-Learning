export async function checkAndUpdateRankAndLevel({
  user_id,
  newXP,
  newElo,
  supabase,
}) {
  // Fetch current level
  const { data: user, error: userError } = await supabase
    .from('Users')
    .select('currentLevel')
    .eq('id', user_id)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  // LEVEL CHECK (based on XP)
  const { data: levelData, error: levelError } = await supabase
    .from('Levels')
    .select('level')
    .lte('minXP', newXP)
    .order('minXP', { ascending: false })
    .limit(1)
    .single();

  const newLevel = levelData?.level ?? user.currentLevel;

  // RANK CHECK (based on ELO)
  let newRank = 'Unranked';
  if (newElo !== null && newElo !== undefined) {
    const { data: rankData, error: rankError } = await supabase
      .from('Ranks')
      .select('rank') // ← fix here
      .lte('min_elo', newElo)
      .order('min_elo', { ascending: false })
      .limit(1)
      .single();

    newRank = rankData?.rank ?? 'Unranked';
  }

  return {
    newLevel,
    newRank,
  };
}
