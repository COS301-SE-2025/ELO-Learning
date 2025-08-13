// Achievement trigger API endpoint
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, achievementType, context } = body;

    console.log('🏆 Frontend API - Achievement trigger request:', {
      userId,
      achievementType,
      context
    });

    // Validate required fields
    if (!userId || !achievementType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, achievementType' },
        { status: 400 }
      );
    }

    // Handle Perfect Session achievement specifically
    if (achievementType === 'Perfect Session') {
      return await handlePerfectSessionAchievement(userId, context);
    }

    // Handle other achievement types
    return NextResponse.json(
      { error: `Achievement type '${achievementType}' not supported yet` },
      { status: 400 }
    );

  } catch (error) {
    console.error('🏆 Frontend API - Achievement trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePerfectSessionAchievement(userId, context) {
  try {
    const { consecutiveCorrect, totalQuestions, mode } = context;

    console.log('🎯 Processing Perfect Session achievement:', {
      userId,
      consecutiveCorrect,
      totalQuestions,
      mode
    });

    // Perfect Session available in all modes now
    if (consecutiveCorrect < 10) {
      return NextResponse.json({
        success: false,
        message: `Need 10 consecutive correct answers, got ${consecutiveCorrect}`,
        unlockedAchievements: []
      });
    }

    // Call backend to trigger Perfect Session achievement
    const response = await fetch(`${API_BASE_URL}/users/${userId}/achievements/perfect-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consecutiveCorrect,
        totalQuestions,
        mode
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('🏆 Backend Perfect Session API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to trigger Perfect Session achievement' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('🏆 Perfect Session achievement result:', result);

    return NextResponse.json({
      success: true,
      message: result.message || 'Perfect Session processed',
      unlockedAchievements: result.unlockedAchievements || []
    });

  } catch (error) {
    console.error('🏆 Perfect Session achievement error:', error);
    return NextResponse.json(
      { error: 'Failed to process Perfect Session achievement' },
      { status: 500 }
    );
  }
}
