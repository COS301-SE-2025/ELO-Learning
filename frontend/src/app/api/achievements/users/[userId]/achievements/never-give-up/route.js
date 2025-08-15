// Never Give Up Achievement API endpoint
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request, { params }) {
  try {
    const { userId } = params;
    const body = await request.json();

    console.log('💪 Frontend API - Never Give Up request:', {
      userId,
      body
    });

    // Proxy the request to the backend
    const response = await fetch(`${API_BASE_URL}/users/${userId}/achievements/never-give-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('💪 Backend Never Give Up API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to trigger Never Give Up achievement' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('💪 Never Give Up achievement result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('💪 Never Give Up achievement error:', error);
    return NextResponse.json(
      { error: 'Failed to process Never Give Up achievement' },
      { status: 500 }
    );
  }
}
