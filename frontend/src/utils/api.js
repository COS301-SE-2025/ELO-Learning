const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // or however you store your JWT token
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all questions (no auth required)
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

export const getQuestionById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionsById/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch question');
    }

    return {
      success: true,
      data: data.question,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all answers (no auth required)
export const getAllAnswers = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/answers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch answers');
    }

    return {
      success: true,
      data: data.answer,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const practiceQuestion = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/practice`, {
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

// NEW MATH VALIDATION API FUNCTIONS

// Validate a math answer
export const validateMathAnswer = async (studentAnswer, correctAnswer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-answer`, {
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

// Quick validation for real-time feedback
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

// Validate math expression format
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

// Submit answer for a specific question (with XP awarding)
export const submitQuestionAnswer = async (
  questionId,
  studentAnswer,
  userId,
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/question/${questionId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentAnswer,
          userId,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit answer');
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

// Get questions by type
export const getQuestionsByType = async (questionType) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/practice/type/${questionType}`,
    );
    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.questions };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error fetching questions by type:', error);
    return { success: false, error: 'Network error' };
  }
};

// Get all achievement categories
export const fetchAchievementCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/achievement-categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch achievement categories');
    }

    return {
      success: true,
      data: data.categories,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all achievements (optionally filtered by category)
export const fetchAllAchievements = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `${API_BASE_URL}/achievements?category_id=${categoryId}`
      : `${API_BASE_URL}/achievements`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch achievements');
    }

    return {
      success: true,
      data: data.achievements,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get user's unlocked achievements
export const fetchUserAchievements = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/achievements`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user achievements');
    }

    return {
      success: true,
      data: data.achievements,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all achievements with user's progress/unlock status
export const fetchUserAchievementsWithStatus = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/achievements/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch achievements with status');
    }

    return {
      success: true,
      data: data.achievements,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update achievement progress (manual trigger)
export const updateAchievementProgress = async (userId, achievementId, increment = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/achievements/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        achievement_id: achievementId,
        increment_by: increment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update achievement progress');
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