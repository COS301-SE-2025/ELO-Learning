// Enhanced LaTeX conversion utility for mathematical expressions

export function convertToLatex(expression) {
  if (!expression || typeof expression !== 'string') {
    return expression;
  }

  let result = expression;

  // Handle absolute value functions - convert abs(...) to |...|
  result = result.replace(
    /abs\s*\(\s*([^()]*(?:\([^()]*\)[^()]*)*)\s*\)/g,
    '|$1|',
  );

  // Handle nested absolute values
  let hasAbsFunction = true;
  while (hasAbsFunction) {
    const beforeReplace = result;
    result = result.replace(/abs\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, '|$1|');
    hasAbsFunction = beforeReplace !== result;
  }

  // Handle inverse trigonometric functions FIRST (before regular trig)
  result = result
    .replace(/\basin\b/g, '\\arcsin')
    .replace(/\bacos\b/g, '\\arccos')
    .replace(/\batan\b/g, '\\arctan');

  // Handle regular trigonometric functions
  result = result
    .replace(/\bsin\b/g, '\\sin')
    .replace(/\bcos\b/g, '\\cos')
    .replace(/\btan\b/g, '\\tan');

  // Handle logarithmic functions
  result = result
    .replace(/\bln\b/g, '\\ln')
    .replace(/\blog\b/g, '\\log')
    .replace(/\blog10\b/g, '\\log_{10}')
    .replace(/\blog2\b/g, '\\log_{2}');

  // Handle square roots
  result = result.replace(
    /sqrt\s*\(\s*([^()]*(?:\([^()]*\)[^()]*)*)\s*\)/g,
    '\\sqrt{$1}',
  );

  // Handle exponents
  result = result
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\^([a-zA-Z]+)/g, '^{$1}');

  // Handle mathematical constants
  result = result
    .replace(/\bpi\b/g, '\\pi')
    .replace(/\btheta\b/g, '\\theta')
    .replace(/\binfinity\b/g, '\\infty')
    .replace(/∞/g, '\\infty')
    .replace(/\bphi\b/g, '\\phi')
    .replace(/\balpha\b/g, '\\alpha')
    .replace(/\bbeta\b/g, '\\beta');

  // Note: Removed calculus functions since Advanced tab was removed

  // Handle operators with proper spacing
  result = result
    .replace(/\*/g, ' \\cdot ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' - ')
    .replace(/=/g, ' = ');

  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// Quick converter for simple expressions
export function quickLatexConvert(expression) {
  if (!expression || typeof expression !== 'string') {
    return expression;
  }

  return expression
    .replace(/abs\s*\(\s*([^()]+)\s*\)/g, '|$1|')
    .replace(/\basin\b/g, '\\arcsin')
    .replace(/\bacos\b/g, '\\arccos')
    .replace(/\batan\b/g, '\\arctan')
    .replace(/\bsin\b/g, '\\sin')
    .replace(/\bcos\b/g, '\\cos')
    .replace(/\btan\b/g, '\\tan')
    .replace(/\bln\b/g, '\\ln')
    .replace(/\blog\b/g, '\\log')
    .replace(/sqrt\s*\(\s*([^()]+)\s*\)/g, '\\sqrt{$1}')
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\*/g, ' \\cdot ')
    .replace(/\bpi\b/g, '\\pi')
    .replace(/\binfinity\b/g, '\\infty')
    .replace(/∞/g, '\\infty')
    .replace(/\s+/g, ' ')
    .trim();
}

export default convertToLatex;
