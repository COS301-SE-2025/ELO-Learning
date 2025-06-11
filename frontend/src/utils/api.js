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
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
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
