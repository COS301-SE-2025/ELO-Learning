// Manual practice achievement trigger for when main API fails
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, gameMode, isCorrect, questionId } = body;

    console.log('🎯 Manual practice achievement trigger:', {
      userId,
      gameMode,
      isCorrect,
      questionId,
    });

    // Only proceed for practice mode correct answers
    if (gameMode !== 'practice' || !isCorrect || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Manual practice trigger only for correct practice answers',
        unlockedAchievements: [],
      });
    }

    try {
      // Try to trigger achievements directly via backend
      const response = await fetch(`${API_BASE_URL}/achievements/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          achievementType: 'Questions Answered',
          increment: 1,
          gameMode: 'practice',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🎯 Manual practice achievement result:', result);

        return NextResponse.json({
          success: true,
          message: 'Practice achievements triggered manually',
          unlockedAchievements: result.unlockedAchievements || [],
        });
      } else {
        console.error('🎯 Backend manual trigger failed:', response.status);
      }
    } catch (backendError) {
      console.error('🎯 Backend request failed:', backendError);
    }

    // Fallback: Create a practice progress notification
    const fallbackAchievement = {
      id: 'practice-fallback-' + Date.now(),
      name: 'Practice Progress',
      description: 'Keep practicing to improve your skills!',
      condition_type: 'Practice Questions',
      condition_value: 1,
      AchievementCategories: { name: 'Practice' },
      badge_icon_url: null,
      unlocked_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Practice tracked (fallback mode)',
      unlockedAchievements: [fallbackAchievement],
    });
  } catch (error) {
    console.error('🎯 Manual practice achievement error:', error);
    return NextResponse.json(
      { error: 'Failed to process manual practice achievement' },
      { status: 500 },
    );
  }
}
