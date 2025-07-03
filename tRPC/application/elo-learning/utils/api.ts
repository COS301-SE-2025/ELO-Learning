// Type definitions
interface Question {
  id: number;
  questionText: string;
  type: string;
  level: number;
  topic: string;
  xpGain: number;
}

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ValidationResponse {
  isCorrect: boolean;
  message?: string;
  explanation?: string;
}

interface SubmissionResponse {
  isCorrect: boolean;
  xpAwarded: number;
  totalXp: number;
  message: string;
}

interface AuthHeaders {
  'Content-Type': string;
  Authorization?: string;
}

const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = (): AuthHeaders => {
  const token = localStorage.getItem('token'); // or however you store your JWT token
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all questions (no auth required)
export const getAllQuestions = async (): Promise<ApiResponse<Question[]>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const getQuestionById = async (
  id: number,
): Promise<ApiResponse<Question>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get all answers (no auth required)
export const getAllAnswers = async (
  id: number,
): Promise<ApiResponse<Answer[]>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const practiceQuestion = async (): Promise<ApiResponse<Question[]>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// NEW MATH VALIDATION API FUNCTIONS

// Validate a math answer
export const validateMathAnswer = async (
  studentAnswer: string,
  correctAnswer: string,
): Promise<ApiResponse<ValidationResponse>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Quick validation for real-time feedback
export const quickValidateMath = async (
  studentAnswer: string,
  correctAnswer: string,
): Promise<ApiResponse<ValidationResponse>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Validate math expression format
export const validateMathExpression = async (
  expression: string,
): Promise<ApiResponse<ValidationResponse>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Submit answer for a specific question (with XP awarding)
export const submitQuestionAnswer = async (
  questionId: number,
  studentAnswer: string,
  userId: number,
): Promise<ApiResponse<SubmissionResponse>> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get questions by type
export const getQuestionsByType = async (
  questionType: string,
): Promise<ApiResponse<Question[]>> => {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};
