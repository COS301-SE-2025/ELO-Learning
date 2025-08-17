// Speed Solver Achievement API endpoint
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request, { params }) {
  try {
    const { userId } = params;
    const body = await request.json();

    console.log('⚡ Frontend API - Speed Solver request:', {
      userId,
      body,
    });

    // Proxy the request to the backend
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/achievements/speed-solver`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      console.error(
        '⚡ Backend Speed Solver API error:',
        response.status,
        errorData,
      );
      return NextResponse.json(
        {
          error:
            errorData.error || 'Failed to trigger Speed Solver achievement',
        },
        { status: response.status },
      );
    }

    const result = await response.json();
    console.log('⚡ Speed Solver achievement result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('⚡ Speed Solver achievement error:', error);
    return NextResponse.json(
      { error: 'Failed to process Speed Solver achievement' },
      { status: 500 },
    );
  }
}
