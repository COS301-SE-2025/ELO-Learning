// ui/question-template.jsx
'use client';

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function QuestionTemplate({ question, calculation }) {
  // Convert mathematical expressions to LaTeX format
  const formatMathInText = (text) => {
    if (!text) return '';
    
    // Check if the text contains mathematical expressions
    const mathPattern = /([x-z]\^?\d*[\+\-\*/\^]*[\d\w]*|[\d]+[\+\-\*/\^]*[x-z][\^]?[\d]*|[x-z][\+\-\*/][x-z\d\^]*)/gi;
    
    // Split text into parts and identify math expressions
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Create a regex to find mathematical expressions
    const fullMathRegex = /([x-z][\^]?[\d]*[\s]*[\+\-\*/][\s]*[\d]*[x-z]*[\^]?[\d]*|[\d]+[\s]*[\+\-\*/][\s]*[x-z][\^]?[\d]*|[x-z][\^][\d]+)/gi;
    
    while ((match = fullMathRegex.exec(text)) !== null) {
      // Add text before the math expression
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Add the math expression
      parts.push({
        type: 'math',
        content: convertToLatex(match[0].trim())
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    // If no math expressions found, return as text
    if (parts.length === 0) {
      return [{ type: 'text', content: text }];
    }
    
    return parts;
  };
  
  // Convert mathematical notation to LaTeX
  const convertToLatex = (mathText) => {
    return mathText
      .replace(/\s/g, '') // Remove spaces first
      .replace(/x\^2/gi, 'x^2')
      .replace(/x\^(\d+)/gi, 'x^{$1}')
      .replace(/(\d+)x/gi, '$1x')
      .replace(/\*/g, ' \\cdot ')
      .replace(/\+/g, ' + ')
      .replace(/\-/g, ' - ')
      .replace(/=/g, ' = ')
      .replace(/pi/gi, '\\pi')
      .replace(/sqrt/gi, '\\sqrt')
      .replace(/infinity/gi, '\\infty');
  };
  
  const formattedQuestion = formatMathInText(question);
  
  return (
    <div>
      <div className="text-center text-xl font-bold my-15 mx-10 md:m-10">
        {formattedQuestion.map((part, index) => {
          if (part.type === 'math') {
            return (
              <InlineMath key={index} math={part.content} />
            );
          } else {
            return (
              <span key={index}>{part.content}</span>
            );
          }
        })}
      </div>
      {calculation && (
        <p className="text-xl text-center">
          <InlineMath math={convertToLatex(calculation)} />
        </p>
      )}
    </div>
  );
}