'use client';
import { useEffect, useState } from 'react';

export default function MatchQuestionTemplate({ question, answers, setAnswer, setIsAnswerCorrect }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState({});
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [hasLostLife, setHasLostLife] = useState(false); // Track if life was already lost for this question
  const [lifeLossMessage, setLifeLossMessage] = useState(''); // Store the reason for life loss
  const [showLifeLossAlert, setShowLifeLossAlert] = useState(false); // Control alert visibility

  // Function to handle life loss
  const loseLife = (reason) => {
    if (hasLostLife) return; // Prevent multiple life losses for the same question
    
    setHasLostLife(true);
    setLifeLossMessage(reason);
    setShowLifeLossAlert(true);
    console.log(`💔 Life lost: ${reason}`);
    
    // Get current lives from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const currentLives = parseInt(localStorage.getItem('lives') || '5');
      const newLives = Math.max(0, currentLives - 1);
      localStorage.setItem('lives', newLives.toString());
      
      // Dispatch a custom event to notify other components about life loss
      window.dispatchEvent(new CustomEvent('lifeLost', { 
        detail: { 
          reason, 
          newLives,
          questionType: 'matching'
        } 
      }));
    }

    // Auto-hide the alert after 3 seconds
    setTimeout(() => {
      setShowLifeLossAlert(false);
    }, 3000);
  };

  // Enhanced parsing function for match pairs
  const parsePairs = () => {
    console.log('🔍 MATCH PARSING - Input data:', { answers, question: question?.questionText });
    
    if (!answers || answers.length === 0) {
      console.log('🔍 MATCH PARSING - No answers provided, using fallback');
      return { left: [], right: [] };
    }

    const leftItems = [];
    const rightItems = [];
    
    // Handle different data formats
    answers.forEach((answer, index) => {
      console.log(`🔍 MATCH PARSING - Processing answer ${index}:`, answer);
      
      let left, right;
      const answerText = typeof answer === 'string' ? answer : (answer.answer_text || answer.answerText || answer);
      
      // Method 1: Check if answer has explicit match_left and match_right fields
      if (answer.match_left && answer.match_right) {
        left = answer.match_left;
        right = answer.match_right;
        console.log(`🔍 MATCH PARSING - Found explicit fields: ${left} → ${right}`);
      }
      // Method 2: Parse from answer_text with various separators
      else if (answerText) {
        if (answerText.includes(' → ')) {
          [left, right] = answerText.split(' → ').map(item => item.trim());
        } else if (answerText.includes('→')) {
          [left, right] = answerText.split('→').map(item => item.trim());
        } else if (answerText.includes(' | ')) {
          [left, right] = answerText.split(' | ').map(item => item.trim());
        } else if (answerText.includes('|')) {
          [left, right] = answerText.split('|').map(item => item.trim());
        } else if (answerText.includes(': ')) {
          [left, right] = answerText.split(': ').map(item => item.trim());
        } else if (answerText.includes(':')) {
          [left, right] = answerText.split(':').map(item => item.trim());
        } else if (answerText.includes(' - ')) {
          [left, right] = answerText.split(' - ').map(item => item.trim());
        } else if (answerText.includes(' = ')) {
          [left, right] = answerText.split(' = ').map(item => item.trim());
        }
        
        if (left && right) {
          console.log(`🔍 MATCH PARSING - Parsed from text: ${left} → ${right}`);
        }
      }
      
      if (left && right) {
        leftItems.push({ 
          id: `left-${index}`, 
          text: left, 
          originalIndex: index,
          pairId: `pair-${index}` 
        });
        rightItems.push({ 
          id: `right-${index}`, 
          text: right, 
          originalIndex: index,
          pairId: `pair-${index}` 
        });
        console.log(`🔍 MATCH PARSING - Added pair: ${left} ↔ ${right} (pair-${index})`);
      } else {
        console.log(`🔍 MATCH PARSING - Could not parse answer ${index}:`, answerText);
      }
    });
    
    console.log(`🔍 MATCH PARSING - Final results: ${leftItems.length} left items, ${rightItems.length} right items`);
    
    // Fallback: Create sample pairs if parsing failed
    if (leftItems.length === 0 && rightItems.length === 0) {
      console.log('🔍 MATCH PARSING - Using fallback data based on question content');
      
      // Try to create pairs based on the question content
      let samplePairs = [];
      
      if (question?.questionText?.toLowerCase().includes('capital')) {
        samplePairs = [
          { left: 'France', right: 'Paris' },
          { left: 'Italy', right: 'Rome' },
          { left: 'Spain', right: 'Madrid' },
          { left: 'Germany', right: 'Berlin' }
        ];
      } else if (question?.questionText?.toLowerCase().includes('programming')) {
        samplePairs = [
          { left: 'JavaScript', right: 'Web Development' },
          { left: 'Python', right: 'Data Science' },
          { left: 'Java', right: 'Enterprise Applications' },
          { left: 'C++', right: 'System Programming' }
        ];
      } else if (question?.questionText?.toLowerCase().includes('transformation')) {
        samplePairs = [
          { left: 'y = f(x) + 3', right: 'Shift up 3 units' },
          { left: 'y = f(x - 2)', right: 'Shift right 2 units' },
          { left: 'y = f(x + 1)', right: 'Shift left 1 unit' },
          { left: 'y = f(x) - 4', right: 'Shift down 4 units' }
        ];
      } else if (question?.questionText?.toLowerCase().includes('function') || 
                 question?.questionText?.toLowerCase().includes('equation') ||
                 question?.questionText?.includes('y =')) {
        samplePairs = [
          { left: 'y = x²', right: 'Parabola' },
          { left: 'y = √x', right: 'Square root curve' },
          { left: 'y = 1/x', right: 'Hyperbola' },
          { left: 'y = |x|', right: 'Absolute value' }
        ];
      } else if (question?.questionText?.toLowerCase().includes('math')) {
        samplePairs = [
          { left: 'Addition', right: '+' },
          { left: 'Subtraction', right: '-' },
          { left: 'Multiplication', right: '×' },
          { left: 'Division', right: '÷' }
        ];
      } else {
        samplePairs = [
          { left: 'Item A', right: 'Match 1' },
          { left: 'Item B', right: 'Match 2' },
          { left: 'Item C', right: 'Match 3' },
          { left: 'Item D', right: 'Match 4' }
        ];
      }
      
      samplePairs.forEach((pair, index) => {
        leftItems.push({ 
          id: `left-${index}`, 
          text: pair.left, 
          originalIndex: index,
          pairId: `pair-${index}` 
        });
        rightItems.push({ 
          id: `right-${index}`, 
          text: pair.right, 
          originalIndex: index,
          pairId: `pair-${index}` 
        });
      });
    }
    
    return { left: leftItems, right: rightItems };
  };

  // Initialize the match pairs
  useEffect(() => {
    const pairs = parsePairs();
    setLeftItems(pairs.left);
    
    // Shuffle right items to make it challenging, but preserve the pairId for validation
    const shuffledRight = [...pairs.right].sort(() => Math.random() - 0.5);
    setRightItems(shuffledRight);
    
    // Reset matches when answers change
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setHasLostLife(false); // Reset life loss status for new question
  }, [answers, question]);

  // Handle selecting items for matching
  const handleLeftSelect = (item) => {
    setSelectedLeft(item);
    if (selectedRight) {
      makeMatch(item, selectedRight);
    }
  };

  const handleRightSelect = (item) => {
    setSelectedRight(item);
    if (selectedLeft) {
      makeMatch(selectedLeft, item);
    }
  };

  // Create a match between selected items
  const makeMatch = (leftItem, rightItem) => {
    const newMatches = {
      ...matches,
      [leftItem.id]: rightItem.id
    };
    setMatches(newMatches);
    setSelectedLeft(null);
    setSelectedRight(null);
    
    // Check if this specific match is incorrect and lose life immediately
    const isThisMatchCorrect = leftItem.pairId === rightItem.pairId;
    if (!isThisMatchCorrect) {
      loseLife(`Incorrect match: "${leftItem.text}" → "${rightItem.text}"`);
    }
    
    // Convert matches object to string format for validation
    const matchStrings = Object.keys(newMatches).map(leftId => {
      const rightId = newMatches[leftId];
      const leftItem = leftItems.find(item => item.id === leftId);
      const rightItem = rightItems.find(item => item.id === rightId);
      return `${leftItem?.text} → ${rightItem?.text}`;
    });
    
    // Update parent components with string format
    setAnswer(matchStrings.join('; '));
    
    // Check if all items are matched
    const allMatched = leftItems.length > 0 && Object.keys(newMatches).length === leftItems.length;
    
    // Always validate current matches, regardless of completion
    const isCorrect = validateMatches(newMatches);
    setIsAnswerCorrect(isCorrect && allMatched);
  };

  // Validate if the matches are correct - FIXED VERSION
  const validateMatches = (currentMatches) => {
    console.log('🔍 VALIDATING MATCHES:', currentMatches);
    console.log('🔍 LEFT ITEMS:', leftItems);
    console.log('🔍 RIGHT ITEMS:', rightItems);
    
    let correctCount = 0;
    const totalPairs = leftItems.length;
    
    for (const leftId in currentMatches) {
      const rightId = currentMatches[leftId];
      
      // Find the corresponding left and right items
      const leftItem = leftItems.find(item => item.id === leftId);
      const rightItem = rightItems.find(item => item.id === rightId);
      
      console.log(`🔍 Checking match: ${leftItem?.text} → ${rightItem?.text}`);
      console.log(`🔍 Left pairId: ${leftItem?.pairId}, Right pairId: ${rightItem?.pairId}`);
      
      if (leftItem && rightItem) {
        // FIXED: Use pairId to determine correct matches (works even with shuffled items)
        if (leftItem.pairId === rightItem.pairId) {
          correctCount++;
          console.log(`✅ Correct match: ${leftItem.text} → ${rightItem.text}`);
        } else {
          console.log(`❌ Incorrect match: ${leftItem.text} → ${rightItem.text}`);
        }
      }
    }
    
    console.log(`🔍 Validation result: ${correctCount}/${totalPairs} correct matches`);
    const isAllCorrect = correctCount === totalPairs;
    return isAllCorrect;
  };

  // Helper function to check if a specific match is correct
  const isMatchCorrect = (leftItem, rightItem) => {
    if (!leftItem || !rightItem) return false;
    return leftItem.pairId === rightItem.pairId;
  };

  // Helper function to get match status for UI
  const getMatchStatus = (item, isLeft = true) => {
    if (isLeft) {
      const rightId = matches[item.id];
      if (!rightId) return { isMatched: false, isCorrect: false };
      const rightItem = rightItems.find(r => r.id === rightId);
      return { 
        isMatched: true, 
        isCorrect: isMatchCorrect(item, rightItem) 
      };
    } else {
      const isMatched = Object.values(matches).includes(item.id);
      if (!isMatched) return { isMatched: false, isCorrect: false };
      const leftId = Object.keys(matches).find(k => matches[k] === item.id);
      const leftItem = leftItems.find(l => l.id === leftId);
      return { 
        isMatched: true, 
        isCorrect: isMatchCorrect(leftItem, item) 
      };
    }
  };

  // Function to check for incomplete matches when leaving the question
  const checkForIncompleteMatches = () => {
    // Only check if user has actually interacted with the question
    // (has made at least one match or lost a life from incorrect matching)
    if (hasLostLife || Object.keys(matches).length === 0) {
      return; // Don't penalize further if already lost life, or if no interaction yet
    }
    
    const totalPairs = leftItems.length;
    const matchedPairs = Object.keys(matches).length;
    
    if (totalPairs > 0 && matchedPairs < totalPairs && matchedPairs > 0) {
      // User has made some matches but not completed all
      loseLife(`Incomplete answer: ${matchedPairs}/${totalPairs} pairs matched`);
    }
    // Note: Removed the "No attempt" case since that should only be checked on explicit submission
  };

  // Only expose a global function that parent components can call manually when needed
  useEffect(() => {
    // Expose function globally for parent components to call before navigation if needed
    window.checkMatchQuestionCompletion = checkForIncompleteMatches;
    
    return () => {
      // Clean up global function
      delete window.checkMatchQuestionCompletion;
    };
  }, [matches, leftItems, hasLostLife]);

  const removeMatch = (leftId) => {
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
    
    // Convert remaining matches to string format
    const matchStrings = Object.keys(newMatches).map(leftId => {
      const rightId = newMatches[leftId];
      const leftItem = leftItems.find(item => item.id === leftId);
      const rightItem = rightItems.find(item => item.id === rightId);
      return `${leftItem?.text} → ${rightItem?.text}`;
    });
    
    setAnswer(matchStrings.length > 0 ? matchStrings.join('; ') : '');
    setIsAnswerCorrect(false);
  };

  // Handle case where no questions are available
  if (!answers || answers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No Match Pairs Available
          </h3>
          <p className="text-yellow-700 mb-4">
            There are no matching pairs configured for this question.
          </p>
          <div className="mt-4 text-sm text-yellow-600 bg-yellow-100 p-3 rounded">
            <p className="font-medium mb-2">Expected formats:</p>
            <ul className="text-left space-y-1">
              <li>• "Left Item → Right Item"</li>
              <li>• "Left Item | Right Item"</li>
              <li>• "Left Item: Right Item"</li>
              <li>• Or separate match_left/match_right fields</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where parsing failed
  if (leftItems.length === 0 && rightItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Cannot Parse Match Pairs
          </h3>
          <p className="text-red-700 mb-4">
            The question data could not be parsed into matching pairs.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Life Loss Alert */}
      {showLifeLossAlert && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg border-2 border-red-600 animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="text-xl">💔</span>
            <div>
              <div className="font-bold">Life Lost!</div>
              <div className="text-sm">{lifeLossMessage}</div>
            </div>
            <button 
              onClick={() => setShowLifeLossAlert(false)}
              className="ml-4 text-white hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Matching Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 text-center border-b pb-2">
            Match These
          </h3>
          {leftItems.map((item) => {
            const matchStatus = getMatchStatus(item, true);
            const isSelected = selectedLeft?.id === item.id;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => matchStatus.isMatched ? removeMatch(item.id) : handleLeftSelect(item)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    matchStatus.isMatched
                      ? matchStatus.isCorrect
                        ? 'bg-green-100 border-green-400 text-green-800 cursor-pointer'
                        : 'bg-red-100 border-red-400 text-red-800 cursor-pointer'
                      : isSelected
                        ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg'
                        : 'bg-[#7D32CE] text-white border-[#7D32CE] hover:bg-[#6B2BB0] hover:shadow-md'
                  }`}
                  title={matchStatus.isMatched ? 'Click to unmap' : 'Click to select'}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.text}</span>
                    {matchStatus.isMatched && (
                      <span className={`text-sm ${matchStatus.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {matchStatus.isCorrect ? '✓ Matched' : '✗ Wrong'}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 text-center border-b pb-2">
            With These
          </h3>
          {rightItems.map((item) => {
            const matchStatus = getMatchStatus(item, false);
            const isSelected = selectedRight?.id === item.id;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => matchStatus.isMatched ? null : handleRightSelect(item)}
                  disabled={matchStatus.isMatched}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    matchStatus.isMatched
                      ? matchStatus.isCorrect
                        ? 'bg-green-100 border-green-400 text-green-800 cursor-default'
                        : 'bg-red-100 border-red-400 text-red-800 cursor-default'
                      : isSelected
                        ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg'
                        : 'bg-[#7D32CE] text-white border-[#7D32CE] hover:bg-[#6B2BB0] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.text}</span>
                    {matchStatus.isMatched && (
                      <span className={`text-sm ${matchStatus.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {matchStatus.isCorrect ? '✓ Matched' : '✗ Wrong'}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      {Object.keys(matches).length === 0 && (
        <div className="text-center text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
          💡 Tip: Click one item from the left, then click its matching item on the right to create a pair.
        </div>
      )}
    </div>
  );
}
