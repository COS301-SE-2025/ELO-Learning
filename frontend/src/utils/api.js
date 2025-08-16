const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Replace your current getAuthToken function with this:

import { getSession } from 'next-auth/react';

// Fixed Helper function to get auth token (client-side only)
async function getAuthToken() {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }

  let token = null;

  try {
    // 🎯 PRIMARY: Try to get token from NextAuth session
    const session = await getSession();
    if (session?.backendToken) {
      token = session.backendToken;
      console.log('🔐 Token retrieved from NextAuth session');
      return token;
    }
  } catch (error) {
    console.warn('🔐 Session retrieval failed:', error);
  }

  // 🔄 FALLBACK: Check localStorage
  const possibleTokens = [
    localStorage.getItem('token'),
    localStorage.getItem('oauth_token'),
    localStorage.getItem('authToken'),
    localStorage.getItem('backendToken'),
  ].filter(Boolean);

  if (possibleTokens.length > 0) {
    token = possibleTokens[0];
    console.log('🔐 Token found in localStorage');
    return token;
  }

  console.log('🔐 No token found');
  return null; // Don't return placeholder-token
}

// Update your fetchUserAchievements function to be async and use await:
export async function fetchUserAchievements(userId) {
  try {
    console.log('🎯 Fetching achievements for user:', userId);

    const token = await getAuthToken(); // Make this async call

    if (!token) {
      console.log('🔐 No authentication token found');
      console.log('🎯 This is normal for newly registered users');
      console.log('🎯 Returning empty achievements array');
      return { achievements: [], total: 0 };
    }

    console.log('✅ Found authentication token, fetching achievements...');

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/achievements`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.log('🔑 Authentication failed - token might be expired');
        return { achievements: [], total: 0 };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      '✅ Successfully fetched achievements:',
      data.total || 0,
      'achievements',
    );

    return {
      achievements: data.achievements || [],
      total: data.total || 0,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error fetching user achievements:', error);
    return { achievements: [], total: 0 };
  }
}

// Get questions by specific type
export async function getQuestionsByType(questionType, limit = 10) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Only add Authorization header on client side
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/questions/type/${encodeURIComponent(
        questionType,
      )}?limit=${limit}`,
      {
        method: 'GET',
        headers,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch questions',
        details: data.details,
      };
    }

    return {
      success: true,
      data: data.data,
      type: data.type,
      count: data.count,
    };
  } catch (error) {
    console.error('Error fetching questions by type:', error);
    return {
      success: false,
      error: 'Network error occurred',
      details: error.message,
    };
  }
}

// Get mixed question types for variety
export async function getMixedQuestions(level = 1, count = 10) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/questions/mixed?level=${level}&count=${count}`,
      {
        method: 'GET',
        headers,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch mixed questions',
        details: data.details,
      };
    }

    return {
      success: true,
      data: data.data,
      level: data.level,
      count: data.count,
    };
  } catch (error) {
    console.error('Error fetching mixed questions:', error);
    return {
      success: false,
      error: 'Network error occurred',
      details: error.message,
    };
  }
}

export async function submitQuestionAnswer({
  questionId,
  userId,
  userAnswer,
  isCorrect,
  timeSpent,
  questionType = null,
  gameMode = 'practice',
}) {
  try {
    // Validate required parameters
    if (!questionId) {
      console.error('❌ Question ID is required but not provided');
      return {
        success: false,
        error: 'Question ID is required',
        details: 'Cannot submit answer without a valid question ID',
      };
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = await getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    console.log('🚀 Submitting answer:', {
      questionId,
      userId,
      gameMode,
      questionType,
    });

    //  Use the endpoint that includes achievement checking
    const response = await fetch(
      `${API_BASE_URL}/question/${questionId}/submit`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentAnswer: userAnswer,
          userId,
          questionType,
          timeSpent,
          gameMode,
          isCorrect, // Include this for achievement logic
        }),
      },
    );

    // Check if the response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:', text.substring(0, 200));
      return {
        success: false,
        error: 'Server returned non-JSON response',
        details: `Expected JSON but got ${contentType}. Response: ${text.substring(
          0,
          100,
        )}...`,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to submit answer',
        details: data.details,
      };
    }

    // Return the full data structure that includes achievements
    console.log('🎯 Full API response data:', data);

    return {
      success: true,
      data: {
        isCorrect: data.isCorrect,
        message: data.message,
        xpAwarded: data.xpAwarded,
        updatedUser: data.updatedUser,
        unlockedAchievements: data.unlockedAchievements || [],
        ...data, // Include any other response data
      },
    };
  } catch (error) {
    console.error('Error submitting answer:', error);
    return {
      success: false,
      error: 'Network error occurred',
      details: error.message,
    };
  }
}
// Keep all your existing functions but add the server-side check
export const getAllQuestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch questions');
    }

    return {
      success: true,
      data: data.questions,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Your existing functions remain the same...
export const practiceQuestion = async () => {
  return await getMixedQuestions(1, 5);
};

export const validateMathExpression = async (expression) => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-expression`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate expression');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const quickValidateMath = async (studentAnswer, correctAnswer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quick-validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentAnswer,
        correctAnswer,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate answer');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
