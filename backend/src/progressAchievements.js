import { supabase } from '../database/supabaseClient.js';

/**
 * Check if user achieved a new personal best ELO rating
 */
async function checkPersonalBestAchievement(userId, newElo, previousElo) {
    console.log(`🎯 Checking Personal Best Achievement for User ${userId}: ${previousElo} → ${newElo}`);
    
    try {
        // Get user's current best ELO rating
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('best_elo_rating')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('❌ Error fetching user for personal best check:', userError);
            return [];
        }

        console.log(`📊 Current best ELO: ${user.best_elo_rating}, New ELO: ${newElo}`);

        // Check if new ELO is higher than best ELO (or if best ELO is null)
        if (user.best_elo_rating === null || newElo > user.best_elo_rating) {
            console.log(`🏆 NEW PERSONAL BEST! ${newElo} > ${user.best_elo_rating}`);
            
            // Update best ELO rating
            const { error: updateError } = await supabase
                .from('Users')
                .update({ best_elo_rating: newElo })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error updating best ELO rating:', updateError);
            } else {
                console.log(`✅ Updated best ELO rating to ${newElo}`);
            }

            // Check if user already has the Personal Best achievement
            const { data: existingAchievement, error: achievementError } = await supabase
                .from('UserAchievements')
                .select('user_id')
                .eq('user_id', userId)
                .eq('achievement_id', 69) // Personal Best Achieved achievement ID
                .single();

            if (achievementError && achievementError.code !== 'PGRST116') {
                console.error('❌ Error checking existing Personal Best achievement:', achievementError);
                return [];
            }

            if (!existingAchievement) {
                // Unlock Personal Best achievement
                const { error: unlockError } = await supabase
                    .from('UserAchievements')
                    .insert({
                        user_id: userId,
                        achievement_id: 69, // Personal Best Achieved
                        unlocked_at: new Date().toISOString()
                    });

                // Handle duplicate key errors gracefully
                if (!unlockError || unlockError.code === '23505') {
                    // Success or duplicate key constraint violation (already unlocked)
                    if (unlockError && unlockError.code === '23505') {
                        console.log('🔄 Personal Best achievement already unlocked (duplicate key handled gracefully)');
                    } else {
                        console.log('🏆 Personal Best Achievement UNLOCKED!');
                        return [{
                            id: 69,
                            name: 'Peak Performance',
                            description: 'Achieve your highest ever personal rating.',
                            unlocked_at: new Date().toISOString()
                        }];
                    }
                } else {
                    console.error('❌ Error unlocking Personal Best achievement:', unlockError.message);
                    return [];
                }
            } else {
                console.log('📈 Personal Best achieved but already unlocked');
            }
        } else {
            console.log(`📊 No personal best (${newElo} ≤ ${user.best_elo_rating})`);
        }

        return [];
    } catch (error) {
        console.error('❌ Error in checkPersonalBestAchievement:', error);
        return [];
    }
}

/**
 * Check if user completed a comeback (recovered from ELO drop)
 */
async function checkComebackAchievement(userId, newElo, previousElo) {
    console.log(`🎯 Checking Comeback Achievement for User ${userId}: ${previousElo} → ${newElo}`);
    
    try {
        // Get user's current progress data
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('last_elo_drop, best_elo_rating')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('❌ Error fetching user for comeback check:', userError);
            return [];
        }

        console.log(`📊 Last ELO drop: ${user.last_elo_drop}, Best ELO: ${user.best_elo_rating}`);

        // If we had an ELO drop of 3+ points and now we're above our previous best
        if (user.last_elo_drop !== null && 
            user.last_elo_drop >= 3 && 
            user.best_elo_rating !== null && 
            newElo > user.best_elo_rating) {
            
            console.log(`🏆 COMEBACK COMPLETED! Recovered from ${user.last_elo_drop} point drop and beat previous best of ${user.best_elo_rating}`);
            
            // Reset the ELO drop tracker
            const { error: updateError } = await supabase
                .from('Users')
                .update({ last_elo_drop: null })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error resetting ELO drop tracker:', updateError);
            }

            // Check if user already has the Comeback achievement
            const { data: existingAchievement, error: achievementError } = await supabase
                .from('UserAchievements')
                .select('user_id')
                .eq('user_id', userId)
                .eq('achievement_id', 70) // Comeback Completed achievement ID
                .single();

            if (achievementError && achievementError.code !== 'PGRST116') {
                console.error('❌ Error checking existing Comeback achievement:', achievementError);
                return [];
            }

            if (!existingAchievement) {
                // Unlock Comeback achievement
                const { error: unlockError } = await supabase
                    .from('UserAchievements')
                    .insert({
                        user_id: userId,
                        achievement_id: 70, // Comeback Completed
                        unlocked_at: new Date().toISOString()
                    });

                // Handle duplicate key errors gracefully
                if (!unlockError || unlockError.code === '23505') {
                    // Success or duplicate key constraint violation (already unlocked)
                    if (unlockError && unlockError.code === '23505') {
                        console.log('🔄 Comeback achievement already unlocked (duplicate key handled gracefully)');
                    } else {
                        console.log('🏆 Comeback Achievement UNLOCKED!');
                        return [{
                            id: 70,
                            name: 'Comeback Kid',
                            description: 'Recover from a 3 point drop to beat your old rating.',
                            unlocked_at: new Date().toISOString()
                        }];
                    }
                } else {
                    console.error('❌ Error unlocking Comeback achievement:', unlockError.message);
                    return [];
                }
            } else {
                console.log('📈 Comeback completed but already unlocked');
            }
        } else {
            console.log(`📊 No comeback (drop: ${user.last_elo_drop}, new: ${newElo}, best: ${user.best_elo_rating})`);
        }

        return [];
    } catch (error) {
        console.error('❌ Error in checkComebackAchievement:', error);
        return [];
    }
}

/**
 * Check if user achieved consecutive improvements
 */
async function checkConsecutiveImprovementsAchievement(userId, eloChange, newElo) {
    console.log(`🎯 Checking Consecutive Improvements for User ${userId}: ELO change ${eloChange}, new ELO: ${newElo}`);
    
    try {
        // Get user's current consecutive improvements count and last session ELO
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('consecutive_improvements, last_session_elo')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('❌ Error fetching user for consecutive improvements check:', userError);
            return [];
        }

        // Count user's total game sessions to determine if they're a new user
        const { data: sessionCount, error: sessionError } = await supabase
            .from('QuestionAttempts')
            .select('user_id', { count: 'exact' })
            .eq('user_id', userId);

        if (sessionError) {
            console.error('❌ Error counting user sessions:', sessionError);
            return [];
        }

        const totalSessions = sessionCount.length || 0;
        let currentCount = user.consecutive_improvements || 0;
        const lastSessionElo = user.last_session_elo;

        console.log(`📊 User ${userId} stats: ${totalSessions} total sessions, consecutive improvements: ${currentCount}, last session ELO: ${lastSessionElo}`);

        // For new users (less than 2 sessions), don't count consecutive improvements yet
        // They need to establish a baseline first
        if (totalSessions < 2) {
            console.log(`🆕 New user with ${totalSessions} sessions - not tracking consecutive improvements yet`);
            
            // Update last_session_elo for future comparisons, but don't count as consecutive improvement
            const { error: updateError } = await supabase
                .from('Users')
                .update({ last_session_elo: newElo }) // Store new ELO as baseline
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error updating last session ELO for new user:', updateError);
            } else {
                console.log(`✅ Set baseline ELO for new user: ${newElo}`);
            }

            return [];
        }

        // For users with established history, check for actual consecutive improvements
        if (eloChange > 0) {
            // ELO improved - but only count if user has a previous session to compare against
            if (lastSessionElo !== null && lastSessionElo !== undefined) {
                currentCount += 1;
                console.log(`📈 ELO improved (+${eloChange}) from established baseline, consecutive count: ${currentCount}`);
            } else {
                // First time setting up consecutive tracking for existing user
                currentCount = 1;
                console.log(`📈 First consecutive improvement tracking for existing user: ${currentCount}`);
            }
            
            // Update consecutive improvements count and last session ELO
            const { error: updateError } = await supabase
                .from('Users')
                .update({ 
                    consecutive_improvements: currentCount,
                    last_session_elo: newElo // Update to new ELO after this session
                })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error updating consecutive improvements:', updateError);
            } else {
                console.log(`✅ Updated consecutive improvements to ${currentCount} and last session ELO to ${newElo}`);
            }

            // Check if we've reached 5 consecutive improvements
            if (currentCount >= 5) {
                console.log(`🏆 CONSECUTIVE IMPROVEMENTS ACHIEVED! ${currentCount} improvements`);
                
                // Check if user already has the Consecutive Improvements achievement
                const { data: existingAchievement, error: achievementError } = await supabase
                    .from('UserAchievements')
                    .select('user_id')
                    .eq('user_id', userId)
                    .eq('achievement_id', 71) // Consecutive Improvements achievement ID
                    .single();

                if (achievementError && achievementError.code !== 'PGRST116') {
                    console.error('❌ Error checking existing Consecutive Improvements achievement:', achievementError);
                    return [];
                }

                if (!existingAchievement) {
                    // Unlock Consecutive Improvements achievement
                    const { error: unlockError } = await supabase
                        .from('UserAchievements')
                        .insert({
                            user_id: userId,
                            achievement_id: 71, // Consecutive Improvements
                            unlocked_at: new Date().toISOString()
                        });

                    // Handle duplicate key errors gracefully
                    if (!unlockError || unlockError.code === '23505') {
                        // Success or duplicate key constraint violation (already unlocked)
                        if (unlockError && unlockError.code === '23505') {
                            console.log('🔄 Consecutive Improvements achievement already unlocked (duplicate key handled gracefully)');
                        } else {
                            console.log('🏆 Consecutive Improvements Achievement UNLOCKED!');
                            return [{
                                id: 71,
                                name: 'Consistent Climber',
                                description: 'Improve your ELO for 5 consecutive sessions.',
                                unlocked_at: new Date().toISOString()
                            }];
                        }
                    } else {
                        console.error('❌ Error unlocking Consecutive Improvements achievement:', unlockError.message);
                        return [];
                    }
                } else {
                    console.log('📈 Consecutive improvements achieved but already unlocked');
                }
            }
        } else if (eloChange < 0) {
            // ELO decreased - reset counter and track the drop
            console.log(`📉 ELO decreased (${eloChange}), resetting consecutive count`);
            
            const eloDrop = Math.abs(eloChange);
            const { error: updateError } = await supabase
                .from('Users')
                .update({ 
                    consecutive_improvements: 0,
                    last_elo_drop: eloDrop,
                    last_session_elo: newElo // Update to new ELO after this session
                })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error resetting consecutive improvements and tracking drop:', updateError);
            } else {
                console.log(`✅ Reset consecutive improvements and tracked ${eloDrop} point drop`);
            }
        } else {
            // No ELO change - update last session ELO but don't affect consecutive count
            console.log(`📊 No ELO change (${eloChange}), keeping consecutive count: ${currentCount}`);
            
            const { error: updateError } = await supabase
                .from('Users')
                .update({ last_session_elo: newElo })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error updating last session ELO:', updateError);
            }
        }

        return [];
    } catch (error) {
        console.error('❌ Error in checkConsecutiveImprovementsAchievement:', error);
        return [];
    }
}

/**
 * Main function to check all progress achievements
 */
async function checkAllProgressAchievements(userId, newElo, previousElo, eloChange) {
    console.log(`\n🏆 === CHECKING ALL PROGRESS ACHIEVEMENTS ===`);
    console.log(`User: ${userId}, ELO: ${previousElo} → ${newElo} (${eloChange >= 0 ? '+' : ''}${eloChange})`);
    
    const unlockedAchievements = [];
    
    try {
        // Check Personal Best Achievement
        const personalBestResults = await checkPersonalBestAchievement(userId, newElo, previousElo);
        unlockedAchievements.push(...personalBestResults);
        
        // Check Comeback Achievement
        const comebackResults = await checkComebackAchievement(userId, newElo, previousElo);
        unlockedAchievements.push(...comebackResults);
        
        // Check Consecutive Improvements Achievement
        const consecutiveResults = await checkConsecutiveImprovementsAchievement(userId, eloChange, newElo);
        unlockedAchievements.push(...consecutiveResults);
        
        console.log(`🎯 Progress Achievement Check Complete: ${unlockedAchievements.length} achievements unlocked`);
        if (unlockedAchievements.length > 0) {
            console.log(`🏆 Unlocked: ${unlockedAchievements.map(a => a.name).join(', ')}`);
        }
        
        return unlockedAchievements;
    } catch (error) {
        console.error('❌ Error in checkAllProgressAchievements:', error);
        return [];
    }
}

export {
    checkAllProgressAchievements, checkComebackAchievement,
    checkConsecutiveImprovementsAchievement, checkPersonalBestAchievement
};

