const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth token (client-side only)
function getAuthToken() {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return null; // Return null on server side
  }
  
  // Try to get token from localStorage (for manual login)
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined') {
    return token;
  }
  
  // Fallback for testing
  return 'placeholder-token';
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

// Enhanced submit function that handles all question types
export async function submitQuestionAnswer({
  questionId,
  userId,
  userAnswer,
  isCorrect,
  timeSpent,
  questionType = null,
}) {
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
      `${API_BASE_URL}/question/${questionId}/submit`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentAnswer: userAnswer,
          userId,
          questionType,
          timeSpent,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to submit answer',
        details: data.details,
      };
    }

    return {
      success: true,
      data: data.data || data,
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
