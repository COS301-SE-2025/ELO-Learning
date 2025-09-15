/**
 * Question Type Detection Utility
 * Provides centralized logic for determining question behavior and keyboard needs
 */

/**
 * All supported question types in the application
 */
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  MATH_INPUT: 'Math Input',
  OPEN_RESPONSE: 'Open Response',
  EXPRESSION_BUILDER: 'Expression Builder',
  FILL_IN_THE_BLANK: 'Fill-in-the-Blank',
  FILL_IN_THE_BLANKS: 'Fill-in-the-Blanks',
  MATCH_QUESTION: 'Match Question',
  MATCHING: 'Matching',
  TRUE_FALSE: 'True/False',
  TRUE_FALSE_ALT: 'True-False'
};

/**
 * Question types that require custom keyboards on mobile
 */
export const CUSTOM_KEYBOARD_TYPES = [
  QUESTION_TYPES.MATH_INPUT,
  QUESTION_TYPES.EXPRESSION_BUILDER,
  QUESTION_TYPES.FILL_IN_THE_BLANK,
  QUESTION_TYPES.FILL_IN_THE_BLANKS
];

/**
 * Question types that require native keyboards on mobile
 */
export const NATIVE_KEYBOARD_TYPES = [
  QUESTION_TYPES.OPEN_RESPONSE
];

/**
 * Question types that don't require keyboards (UI-only interaction)
 */
export const NO_KEYBOARD_TYPES = [
  QUESTION_TYPES.MULTIPLE_CHOICE,
  QUESTION_TYPES.MATCH_QUESTION,
  QUESTION_TYPES.MATCHING,
  QUESTION_TYPES.TRUE_FALSE,
  QUESTION_TYPES.TRUE_FALSE_ALT
];

/**
 * Normalize question type string to handle variations
 * @param {string} questionType - Raw question type string
 * @returns {string} Normalized question type
 */
export const normalizeQuestionType = (questionType) => {
  if (!questionType || typeof questionType !== 'string') {
    return '';
  }
  
  const normalized = questionType.trim();
  
  // Handle common variations
  const typeMap = {
    'math input': QUESTION_TYPES.MATH_INPUT,
    'mathinput': QUESTION_TYPES.MATH_INPUT,
    'math-input': QUESTION_TYPES.MATH_INPUT,
    'open response': QUESTION_TYPES.OPEN_RESPONSE,
    'openresponse': QUESTION_TYPES.OPEN_RESPONSE,
    'open-response': QUESTION_TYPES.OPEN_RESPONSE,
    'expression builder': QUESTION_TYPES.EXPRESSION_BUILDER,
    'expressionbuilder': QUESTION_TYPES.EXPRESSION_BUILDER,
    'expression-builder': QUESTION_TYPES.EXPRESSION_BUILDER,
    'fill in the blank': QUESTION_TYPES.FILL_IN_THE_BLANK,
    'fill-in-the-blank': QUESTION_TYPES.FILL_IN_THE_BLANK,
    'fillintheblank': QUESTION_TYPES.FILL_IN_THE_BLANK,
    'fill in the blanks': QUESTION_TYPES.FILL_IN_THE_BLANKS,
    'fill-in-the-blanks': QUESTION_TYPES.FILL_IN_THE_BLANKS,
    'fillintheblanks': QUESTION_TYPES.FILL_IN_THE_BLANKS,
    'match question': QUESTION_TYPES.MATCH_QUESTION,
    'matchquestion': QUESTION_TYPES.MATCH_QUESTION,
    'match-question': QUESTION_TYPES.MATCH_QUESTION,
    'matching': QUESTION_TYPES.MATCHING,
    'multiple choice': QUESTION_TYPES.MULTIPLE_CHOICE,
    'multiplechoice': QUESTION_TYPES.MULTIPLE_CHOICE,
    'multiple-choice': QUESTION_TYPES.MULTIPLE_CHOICE,
    'true/false': QUESTION_TYPES.TRUE_FALSE,
    'true false': QUESTION_TYPES.TRUE_FALSE,
    'truefalse': QUESTION_TYPES.TRUE_FALSE,
    'true-false': QUESTION_TYPES.TRUE_FALSE_ALT
  };
  
  const lowerCaseType = normalized.toLowerCase();
  return typeMap[lowerCaseType] || normalized;
};

/**
 * Check if a question type requires a custom keyboard
 * @param {string} questionType - Question type to check
 * @returns {boolean} True if custom keyboard is needed
 */
export const requiresCustomKeyboard = (questionType) => {
  const normalized = normalizeQuestionType(questionType);
  return CUSTOM_KEYBOARD_TYPES.includes(normalized);
};

/**
 * Check if a question type requires a native keyboard
 * @param {string} questionType - Question type to check
 * @returns {boolean} True if native keyboard is needed
 */
export const requiresNativeKeyboard = (questionType) => {
  const normalized = normalizeQuestionType(questionType);
  return NATIVE_KEYBOARD_TYPES.includes(normalized);
};

/**
 * Check if a question type requires no keyboard (UI-only)
 * @param {string} questionType - Question type to check
 * @returns {boolean} True if no keyboard is needed
 */
export const requiresNoKeyboard = (questionType) => {
  const normalized = normalizeQuestionType(questionType);
  return NO_KEYBOARD_TYPES.includes(normalized);
};

/**
 * Get keyboard behavior recommendation for a question type
 * @param {string} questionType - Question type to analyze
 * @returns {object} Keyboard behavior configuration
 */
export const getKeyboardBehavior = (questionType) => {
  const normalized = normalizeQuestionType(questionType);
  
  return {
    questionType: normalized,
    needsCustomKeyboard: requiresCustomKeyboard(normalized),
    needsNativeKeyboard: requiresNativeKeyboard(normalized),
    needsNoKeyboard: requiresNoKeyboard(normalized),
    preventNativeKeyboard: requiresCustomKeyboard(normalized),
    allowNativeKeyboard: requiresNativeKeyboard(normalized) || requiresNoKeyboard(normalized)
  };
};

/**
 * Get the custom keyboard type for a question
 * @param {string} questionType - Question type
 * @returns {string|null} Custom keyboard type or null
 */
export const getCustomKeyboardType = (questionType) => {
  const normalized = normalizeQuestionType(questionType);
  
  switch (normalized) {
    case QUESTION_TYPES.MATH_INPUT:
      return 'math';
    case QUESTION_TYPES.EXPRESSION_BUILDER:
      return 'expression';
    case QUESTION_TYPES.FILL_IN_THE_BLANK:
    case QUESTION_TYPES.FILL_IN_THE_BLANKS:
      return 'text';
    default:
      return null;
  }
};

/**
 * Get validation requirements for a question type
 * @param {string} questionType - Question type
 * @returns {object} Validation configuration
 */
export const getValidationRequirements = (questionType) => {
  const normalized = normalizeQuestionType(questionType);
  
  switch (normalized) {
    case QUESTION_TYPES.MATH_INPUT:
      return {
        requiresValidExpression: true,
        minimumLength: 1,
        allowEmpty: false,
        validateMathSyntax: true
      };
    
    case QUESTION_TYPES.OPEN_RESPONSE:
      return {
        requiresValidExpression: false,
        minimumLength: 10,
        allowEmpty: false,
        validateMathSyntax: false
      };
    
    case QUESTION_TYPES.EXPRESSION_BUILDER:
      return {
        requiresValidExpression: true,
        minimumLength: 1,
        allowEmpty: false,
        validateMathSyntax: true
      };
    
    case QUESTION_TYPES.FILL_IN_THE_BLANK:
    case QUESTION_TYPES.FILL_IN_THE_BLANKS:
      return {
        requiresValidExpression: false,
        minimumLength: 1,
        allowEmpty: false,
        validateMathSyntax: false
      };
    
    case QUESTION_TYPES.MULTIPLE_CHOICE:
    case QUESTION_TYPES.TRUE_FALSE:
    case QUESTION_TYPES.TRUE_FALSE_ALT:
      return {
        requiresValidExpression: false,
        minimumLength: 0,
        allowEmpty: false,
        validateMathSyntax: false
      };
    
    case QUESTION_TYPES.MATCH_QUESTION:
    case QUESTION_TYPES.MATCHING:
      return {
        requiresValidExpression: false,
        minimumLength: 0,
        allowEmpty: false,
        validateMathSyntax: false,
        requiresAllMatches: true
      };
    
    default:
      return {
        requiresValidExpression: false,
        minimumLength: 0,
        allowEmpty: true,
        validateMathSyntax: false
      };
  }
};

/**
 * Check if answer is valid for the question type
 * @param {string} questionType - Question type
 * @param {any} answer - Answer to validate
 * @param {boolean} isValidExpression - Whether expression is mathematically valid
 * @returns {boolean} True if answer is valid
 */
export const isAnswerValid = (questionType, answer, isValidExpression = true) => {
  const requirements = getValidationRequirements(questionType);
  
  // Check if empty answer is allowed
  if (!answer || (typeof answer === 'string' && !answer.trim())) {
    return requirements.allowEmpty;
  }
  
  // Check minimum length for string answers
  if (typeof answer === 'string') {
    if (answer.trim().length < requirements.minimumLength) {
      return false;
    }
  }
  
  // Check math expression validity
  if (requirements.requiresValidExpression && !isValidExpression) {
    return false;
  }
  
  // Special handling for different question types
  const normalized = normalizeQuestionType(questionType);
  
  switch (normalized) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
    case QUESTION_TYPES.TRUE_FALSE:
    case QUESTION_TYPES.TRUE_FALSE_ALT:
      return answer !== null && answer !== undefined && answer !== '';
    
    case QUESTION_TYPES.MATCH_QUESTION:
    case QUESTION_TYPES.MATCHING:
      if (typeof answer === 'object' && answer !== null) {
        const matches = Object.keys(answer);
        return matches.length > 0 && matches.every(key => answer[key] && answer[key].trim());
      }
      return false;
    
    case QUESTION_TYPES.FILL_IN_THE_BLANKS:
      if (typeof answer === 'object' && answer !== null) {
        const blanks = Object.values(answer);
        return blanks.length > 0 && blanks.every(blank => blank && blank.trim());
      }
      return false;
    
    default:
      return true;
  }
};

/**
 * Get question type from question object
 * @param {object} question - Question object
 * @returns {string} Normalized question type
 */
export const getQuestionType = (question) => {
  if (!question) return '';
  
  // Check various possible type fields
  const type = question.type || 
               question.questionType || 
               question.question_type ||
               question.Type ||
               '';
  
  return normalizeQuestionType(type);
};
