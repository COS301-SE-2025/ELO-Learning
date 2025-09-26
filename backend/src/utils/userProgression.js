export async function checkAndUpdateRankAndLevel({
  user_id,
  newXP,
  newElo,
  supabase,
}) {
  // Fetch current level and rank
  const { data: user, error: userError } = await supabase
    .from('Users')
    .select('currentLevel, rank')
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
      .select('rank')
      .lte('min_elo', newElo)
      .order('min_elo', { ascending: false })
      .limit(1)
      .single();

    newRank = rankData?.rank ?? 'Unranked';
  }

  // Prevent demotion below Iron
  if (
    (user.rank === 'Iron' || user.rank === null || user.rank === undefined) &&
    newRank === 'Unranked'
  ) {
    newRank = 'Iron';
  }

  return {
    newLevel,
    newRank,
  };
}

//Only checks the current rank and level without updating them
export async function checkRankAndLevelOnly({ user_id, supabase }) {
  // Fetch current level and rank
  const { data: user, error: userError } = await supabase
    .from('Users')
    .select('currentLevel, rank')
    .eq('id', user_id)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  return {
    currentLevel: user.currentLevel,
    currentRank: user.rank ?? 'Unranked',
  };
}
