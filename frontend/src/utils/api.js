const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  return null;
}

// Helper function to handle API responses and errors
async function handleApiResponse(response, endpoint) {
  // Check if response is ok first
  if (!response.ok) {
    // Try to get error message from response
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      } catch (jsonError) {
        // If JSON parsing fails, use status text
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } else {
      // Non-JSON error response (likely HTML error page)
      const textResponse = await response.text();
      console.error(
        `❌ ${endpoint} returned non-JSON response:`,
        textResponse.substring(0, 200),
      );

      if (response.status === 404) {
        throw new Error(`Endpoint not found: ${endpoint}`);
      } else if (response.status >= 500) {
        throw new Error(
          `Server error (${response.status}). Please try again later.`,
        );
      } else {
        throw new Error(
          `Request failed (${response.status}): ${response.statusText}`,
        );
      }
    }
  }

  // Parse JSON response
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const textResponse = await response.text();
    console.error(
      `❌ Expected JSON but got ${contentType}:`,
      textResponse.substring(0, 200),
    );
    throw new Error(
      `Server returned unexpected content type: ${contentType || 'unknown'}`,
    );
  }

  try {
    return await response.json();
  } catch (parseError) {
    console.error('❌ Failed to parse JSON response:', parseError);
    throw new Error('Invalid JSON response from server');
  }
}

// Update your fetchUserAchievements function
export async function fetchUserAchievements(userId) {
  try {
    console.log('🎯 Fetching achievements for user:', userId);

    const token = await getAuthToken();

    if (!token) {
      console.log('🔐 No authentication token found');
      console.log('🎯 This is normal for newly registered users');
      console.log('🎯 Returning empty achievements array');
      return { achievements: [], total: 0 };
    }

    console.log('✅ Found authentication token, fetching achievements...');

    const endpoint = `${API_BASE_URL}/users/${userId}/achievements`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.log('🔑 Authentication failed - token might be expired');
      return { achievements: [], total: 0 };
    }

    const data = await handleApiResponse(response, endpoint);

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

// Get questions by specific type - FIXED
export async function getQuestionsByType(questionType, limit = 10) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Only add Authorization header on client side
    if (typeof window !== 'undefined') {
      const token = await getAuthToken(); // Make this async
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const endpoint = `${API_BASE_URL}/questions/type/${encodeURIComponent(
      questionType,
    )}?limit=${limit}`;
    console.log('🎯 Fetching questions from:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    const data = await handleApiResponse(response, endpoint);

    return {
      success: true,
      data: data.data,
      type: data.type,
      count: data.count,
    };
  } catch (error) {
    console.error('❌ Error fetching questions by type:', error);
    return {
      success: false,
      error: error.message,
      details: 'Check console for more details',
    };
  }
}

// Get mixed question types for variety - FIXED
export async function getMixedQuestions(level = 1, count = 10) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = await getAuthToken(); // Make this async
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const endpoint = `${API_BASE_URL}/questions/mixed?level=${level}&count=${count}`;
    console.log('🎯 Fetching mixed questions from:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    const data = await handleApiResponse(response, endpoint);

    return {
      success: true,
      data: data.data,
      level: data.level,
      count: data.count,
    };
  } catch (error) {
    console.error('❌ Error fetching mixed questions:', error);
    return {
      success: false,
      error: error.message,
      details: 'Check console for more details',
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

    const endpoint = `${API_BASE_URL}/question/${questionId}/submit`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studentAnswer: userAnswer,
        userId,
        questionType,
        timeSpent,
        gameMode,
        isCorrect,
      }),
    });

    const data = await handleApiResponse(response, endpoint);

    console.log('🎯 Full API response data:', data);

    return {
      success: true,
      data: {
        isCorrect: data.isCorrect,
        message: data.message,
        xpAwarded: data.xpAwarded,
        updatedUser: data.updatedUser,
        unlockedAchievements: data.unlockedAchievements || [],
        ...data,
      },
    };
  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    return {
      success: false,
      error: error.message,
      details: 'Check console for more details',
    };
  }
}

// Get all questions - IMPROVED
export const getAllQuestions = async () => {
  try {
    const endpoint = `${API_BASE_URL}/questions`;
    console.log('🎯 Fetching all questions from:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse(response, endpoint);

    return {
      success: true,
      data: data.questions,
    };
  } catch (error) {
    console.error('❌ Error fetching all questions:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Practice question helper
export const practiceQuestion = async () => {
  return await getMixedQuestions(1, 5);
};

// Validate math expression - IMPROVED
export const validateMathExpression = async (expression) => {
  try {
    const endpoint = `${API_BASE_URL}/validate-expression`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression,
      }),
    });

    const data = await handleApiResponse(response, endpoint);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Error validating math expression:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Quick validate math - IMPROVED
export const quickValidateMath = async (studentAnswer, correctAnswer) => {
  try {
    const endpoint = `${API_BASE_URL}/quick-validate`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentAnswer,
        correctAnswer,
      }),
    });

    const data = await handleApiResponse(response, endpoint);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Error validating answer:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
