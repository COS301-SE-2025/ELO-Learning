'use client';

import { useEffect, useState } from 'react';

export default function MatchQuestionTemplate({
  question,
  answers,
  setAnswer,
  setIsAnswerCorrect,
}) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState({});
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [incorrectMatches, setIncorrectMatches] = useState(new Set()); // Track incorrect matches to prevent duplicate life loss
  const [lifeLossMessage, setLifeLossMessage] = useState(''); // Store the reason for life loss
  const [showLifeLossAlert, setShowLifeLossAlert] = useState(false); // Control alert visibility
  const [correctPairs, setCorrectPairs] = useState([]); // Store the correct pairs for validation

  // Enhanced function to handle life loss with better tracking
  const loseLife = (reason, matchDetails = null) => {
    console.log(`💔 Attempting to lose life: ${reason}`, { matchDetails });

    // Allow multiple life losses for different incorrect matches, but track them
    setLifeLossMessage(reason);
    setShowLifeLossAlert(true);

    // Get current lives from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const currentLives = parseInt(localStorage.getItem('lives') || '5');
      const newLives = Math.max(0, currentLives - 1);
      localStorage.setItem('lives', newLives.toString());

      console.log(
        `💔 Life lost! Lives: ${currentLives} → ${newLives}. Reason: ${reason}`,
      );

      // Dispatch a custom event to notify other components about life loss
      window.dispatchEvent(
        new CustomEvent('lifeLost', {
          detail: {
            reason,
            newLives,
            questionType: 'matching',
            matchDetails,
          },
        }),
      );
    }

    // Auto-hide the alert after 4 seconds (increased for better visibility)
    setTimeout(() => {
      setShowLifeLossAlert(false);
    }, 4000);
  };

  // Enhanced parsing function for match pairs - handles multiple formats
  const parsePairs = () => {
    console.log('🔍 MATCH PARSING - Input data:', {
      answers,
      question: question?.questionText,
    });

    if (!answers || answers.length === 0) {
      console.log('🔍 MATCH PARSING - No answers provided, using fallback');
      return { left: [], right: [], correctPairs: [] };
    }

    const leftItems = [];
    const rightItems = [];
    const correctPairs = [];

    // Handle different data formats with improved parsing
    answers.forEach((answer, index) => {
      console.log(`🔍 MATCH PARSING - Processing answer ${index}:`, answer);

      let left, right;
      const answerText =
        typeof answer === 'string'
          ? answer
          : answer.answer_text || answer.answerText || answer;

      // Method 1: Check if answer has explicit match_left and match_right fields
      if (answer.match_left && answer.match_right) {
        left = answer.match_left;
        right = answer.match_right;
        console.log(
          `🔍 MATCH PARSING - Found explicit fields: ${left} → ${right}`,
        );
      }
      // Method 2: Parse from answer_text with various separators (enhanced list)
      else if (answerText) {
        // Try multiple separators in order of preference
        const separators = [
          ' → ',
          '→', // Arrow separators
          ' | ',
          '|', // Pipe separators
          ': ',
          ':', // Colon separators
          ' - ',
          '-', // Dash separators
          ' = ',
          '=', // Equals separators
          ' ~ ',
          '~', // Tilde separators
          ' <-> ',
          '<->', // Bidirectional arrows
          ' ↔ ',
          '↔', // Unicode bidirectional
          ' matches ',
          ' match ', // Text-based separators
        ];

        for (const separator of separators) {
          if (answerText.includes(separator)) {
            const parts = answerText
              .split(separator)
              .map((item) => item.trim());
            if (parts.length >= 2 && parts[0] && parts[1]) {
              left = parts[0];
              right = parts[1];
              console.log(
                `🔍 MATCH PARSING - Parsed with "${separator}": ${left} → ${right}`,
              );
              break;
            }
          }
        }

        // Fallback: Try comma separation for simple lists
        if (!left && !right && answerText.includes(',')) {
          const parts = answerText.split(',').map((item) => item.trim());
          if (parts.length >= 2) {
            left = parts[0];
            right = parts[1];
            console.log(
              `🔍 MATCH PARSING - Parsed with comma: ${left} → ${right}`,
            );
          }
        }
      }

      if (left && right) {
        // Store correct pair mapping (left text → right text)
        correctPairs.push({
          leftText: left.trim(),
          rightText: right.trim(),
          originalIndex: index,
        });

        leftItems.push({
          id: `left-${index}`,
          text: left.trim(),
          originalIndex: index,
        });

        // Check if this right text already exists to avoid duplicates
        let existingRightItem = rightItems.find(
          (item) => item.text.trim() === right.trim(),
        );
        if (!existingRightItem) {
          rightItems.push({
            id: `right-${rightItems.length}`,
            text: right.trim(),
            originalIndex: index,
          });
        }

        console.log(
          `🔍 MATCH PARSING - Added pair: ${left.trim()} ↔ ${right.trim()}`,
        );
      } else {
        console.log(
          `🔍 MATCH PARSING - Could not parse answer ${index}:`,
          answerText,
        );
      }
    });

    console.log(
      `🔍 MATCH PARSING - Final results: ${leftItems.length} left items, ${rightItems.length} right items`,
    );
    console.log('🔍 CORRECT PAIRS:', correctPairs);

    // Fallback: Create sample pairs if parsing failed
    if (leftItems.length === 0 && rightItems.length === 0) {
      console.log(
        '🔍 MATCH PARSING - Using fallback data based on question content',
      );

      // Try to create pairs based on the question content including trig functions
      let samplePairs = [];

      if (
        question?.questionText?.toLowerCase().includes('trigonometric') ||
        question?.questionText?.toLowerCase().includes('trig') ||
        question?.questionText?.toLowerCase().includes('period')
      ) {
        samplePairs = [
          { left: 'sin(x)', right: '360°' },
          { left: 'cos(x)', right: '360°' },
          { left: 'tan(x)', right: '180°' },
        ];
      } else if (question?.questionText?.toLowerCase().includes('capital')) {
        samplePairs = [
          { left: 'France', right: 'Paris' },
          { left: 'Italy', right: 'Rome' },
          { left: 'Spain', right: 'Madrid' },
          { left: 'Germany', right: 'Berlin' },
        ];
      } else if (
        question?.questionText?.toLowerCase().includes('programming')
      ) {
        samplePairs = [
          { left: 'JavaScript', right: 'Web Development' },
          { left: 'Python', right: 'Data Science' },
          { left: 'Java', right: 'Enterprise Applications' },
          { left: 'C++', right: 'System Programming' },
        ];
      } else if (
        question?.questionText?.toLowerCase().includes('transformation')
      ) {
        samplePairs = [
          { left: 'y = f(x) + 3', right: 'Shift up 3 units' },
          { left: 'y = f(x - 2)', right: 'Shift right 2 units' },
          { left: 'y = f(x + 1)', right: 'Shift left 1 unit' },
          { left: 'y = f(x) - 4', right: 'Shift down 4 units' },
        ];
      } else if (
        question?.questionText?.toLowerCase().includes('function') ||
        question?.questionText?.toLowerCase().includes('equation') ||
        question?.questionText?.includes('y =')
      ) {
        samplePairs = [
          { left: 'y = x²', right: 'Parabola' },
          { left: 'y = √x', right: 'Square root curve' },
          { left: 'y = 1/x', right: 'Hyperbola' },
          { left: 'y = |x|', right: 'Absolute value' },
        ];
      } else if (question?.questionText?.toLowerCase().includes('math')) {
        samplePairs = [
          { left: 'Addition', right: '+' },
          { left: 'Subtraction', right: '-' },
          { left: 'Multiplication', right: '×' },
          { left: 'Division', right: '÷' },
        ];
      } else {
        samplePairs = [
          { left: 'Item A', right: 'Match 1' },
          { left: 'Item B', right: 'Match 2' },
          { left: 'Item C', right: 'Match 3' },
          { left: 'Item D', right: 'Match 4' },
        ];
      }

      // Build items and correct pairs from sample data
      samplePairs.forEach((pair, index) => {
        correctPairs.push({ leftText: pair.left, rightText: pair.right });

        leftItems.push({
          id: `left-${index}`,
          text: pair.left,
          originalIndex: index,
        });

        // Check if this right text already exists
        let existingRightItem = rightItems.find(
          (item) => item.text === pair.right,
        );
        if (!existingRightItem) {
          rightItems.push({
            id: `right-${rightItems.length}`,
            text: pair.right,
            originalIndex: index,
          });
        }
      });
    }

    return { left: leftItems, right: rightItems, correctPairs };
  };

  // Initialize the match pairs
  useEffect(() => {
    const pairs = parsePairs();
    setLeftItems(pairs.left);
    setCorrectPairs(pairs.correctPairs);

    // Shuffle right items to make it challenging
    const shuffledRight = [...pairs.right].sort(() => Math.random() - 0.5);
    setRightItems(shuffledRight);

    // Reset matches when answers change
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setIncorrectMatches(new Set()); // Reset incorrect matches tracking for new question
  }, [answers, question]);

  // Handle selecting items for matching

  const handleLeftSelect = (item) => {
    // If already matched, do nothing
    if (matches[item.id]) return;
    setSelectedLeft(item);
    if (selectedRight) {
      makeMatch(item, selectedRight);
    }
  };

  const handleRightSelect = (item) => {
    // If already matched, do nothing
    if (Object.values(matches).includes(item.id)) return;
    setSelectedRight(item);
    if (selectedLeft) {
      makeMatch(selectedLeft, item);
    }
  };

  // Create a match between selected items with enhanced validation
  const makeMatch = (leftItem, rightItem) => {
    console.log(`🔗 Making match: ${leftItem.text} → ${rightItem.text}`);

    const newMatches = {
      ...matches,
      [leftItem.id]: rightItem.id,
    };
    setMatches(newMatches);
    setSelectedLeft(null);
    setSelectedRight(null);

    // Check if this specific match is incorrect and lose life immediately
    const isThisMatchCorrect = isMatchCorrect(leftItem, rightItem);
    const matchKey = `${leftItem.text}→${rightItem.text}`;

    console.log(
      `🔍 Match validation: ${leftItem.text} → ${rightItem.text} = ${isThisMatchCorrect ? 'CORRECT' : 'INCORRECT'}`,
    );

    if (!isThisMatchCorrect) {
      // Only lose life if this specific incorrect match hasn't been made before
      if (!incorrectMatches.has(matchKey)) {
        setIncorrectMatches((prev) => new Set([...prev, matchKey]));
        loseLife(`Incorrect match: "${leftItem.text}" → "${rightItem.text}"`, {
          leftText: leftItem.text,
          rightText: rightItem.text,
          expectedMatches: correctPairs.filter(
            (pair) => pair.leftText === leftItem.text,
          ),
        });
      } else {
        console.log(
          `⚠️ Duplicate incorrect match detected, no additional life loss: ${matchKey}`,
        );
      }
    } else {
      console.log(
        `✅ Correct match made: ${leftItem.text} → ${rightItem.text}`,
      );
    }

    // Convert matches object to string format for validation
    const matchStrings = Object.keys(newMatches).map((leftId) => {
      const rightId = newMatches[leftId];
      const leftItem = leftItems.find((item) => item.id === leftId);
      const rightItem = rightItems.find((item) => item.id === rightId);
      return `${leftItem?.text} → ${rightItem?.text}`;
    });

    // Update parent components with string format
    setAnswer(matchStrings.join('; '));

    // Check if all items are matched
    const allMatched =
      leftItems.length > 0 &&
      Object.keys(newMatches).length === leftItems.length;

    // Always validate current matches, regardless of completion
    const isCorrect = validateMatches(newMatches);
    setIsAnswerCorrect(isCorrect && allMatched);

    console.log(
      `🔍 Overall validation: ${isCorrect ? 'VALID' : 'INVALID'}, All matched: ${allMatched}`,
    );
  };

  // ENHANCED VALIDATION: Check against correct pairs with better matching logic
  const validateMatches = (currentMatches) => {
    console.log('🔍 VALIDATING MATCHES:', currentMatches);
    console.log('🔍 LEFT ITEMS:', leftItems);
    console.log('🔍 RIGHT ITEMS:', rightItems);
    console.log('🔍 CORRECT PAIRS:', correctPairs);

    let correctCount = 0;
    const totalPairs = leftItems.length;

    for (const leftId in currentMatches) {
      const rightId = currentMatches[leftId];

      // Find the corresponding left and right items
      const leftItem = leftItems.find((item) => item.id === leftId);
      const rightItem = rightItems.find((item) => item.id === rightId);

      console.log(`🔍 Checking match: ${leftItem?.text} → ${rightItem?.text}`);

      if (leftItem && rightItem) {
        // ENHANCED LOGIC: Check if this left→right mapping exists in correctPairs
        // Use case-insensitive and trimmed comparison for better matching
        const isCorrect = correctPairs.some(
          (pair) =>
            pair.leftText.toLowerCase().trim() ===
              leftItem.text.toLowerCase().trim() &&
            pair.rightText.toLowerCase().trim() ===
              rightItem.text.toLowerCase().trim(),
        );

        if (isCorrect) {
          correctCount++;
          console.log(`✅ Correct match: ${leftItem.text} → ${rightItem.text}`);
        } else {
          console.log(
            `❌ Incorrect match: ${leftItem.text} → ${rightItem.text}`,
          );
          // Log what the correct matches should be for this left item
          const expectedMatches = correctPairs.filter(
            (pair) =>
              pair.leftText.toLowerCase().trim() ===
              leftItem.text.toLowerCase().trim(),
          );
          console.log(
            `Expected matches for "${leftItem.text}":`,
            expectedMatches,
          );
        }
      }
    }

    console.log(
      `🔍 Validation result: ${correctCount}/${totalPairs} correct matches`,
    );
    const isAllCorrect = correctCount === totalPairs;
    return isAllCorrect;
  };

  // Helper function to check if a specific match is correct with enhanced comparison
  const isMatchCorrect = (leftItem, rightItem) => {
    if (!leftItem || !rightItem || !correctPairs.length) {
      console.log('🔍 isMatchCorrect: Missing data', {
        leftItem: !!leftItem,
        rightItem: !!rightItem,
        correctPairsCount: correctPairs.length,
      });
      return false;
    }

    // ENHANCED LOGIC: Case-insensitive and trimmed comparison
    const isCorrect = correctPairs.some((pair) => {
      const leftMatch =
        pair.leftText.toLowerCase().trim() ===
        leftItem.text.toLowerCase().trim();
      const rightMatch =
        pair.rightText.toLowerCase().trim() ===
        rightItem.text.toLowerCase().trim();
      return leftMatch && rightMatch;
    });

    console.log(
      `🔍 isMatchCorrect: "${leftItem.text}" → "${rightItem.text}" = ${isCorrect}`,
    );
    if (!isCorrect) {
      // Log what correct matches exist for this left item
      const possibleMatches = correctPairs.filter(
        (pair) =>
          pair.leftText.toLowerCase().trim() ===
          leftItem.text.toLowerCase().trim(),
      );
      console.log(
        `🔍 Possible correct matches for "${leftItem.text}":`,
        possibleMatches,
      );
    }

    return isCorrect;
  };

  // Helper function to get match status for UI
  const getMatchStatus = (item, isLeft = true) => {
    if (isLeft) {
      const rightId = matches[item.id];
      if (!rightId) return { isMatched: false, isCorrect: false };
      const rightItem = rightItems.find((r) => r.id === rightId);
      return {
        isMatched: true,
        isCorrect: isMatchCorrect(item, rightItem),
      };
    } else {
      const isMatched = Object.values(matches).includes(item.id);
      if (!isMatched) return { isMatched: false, isCorrect: false };
      const leftId = Object.keys(matches).find((k) => matches[k] === item.id);
      const leftItem = leftItems.find((l) => l.id === leftId);
      return {
        isMatched: true,
        isCorrect: isMatchCorrect(leftItem, item),
      };
    }
  };

  // Function to check for incomplete matches when leaving the question
  const checkForIncompleteMatches = () => {
    // Only check if user has actually interacted with the question
    // (has made at least one match)
    if (Object.keys(matches).length === 0) {
      return; // Don't penalize if no interaction yet
    }

    const totalPairs = leftItems.length;
    const matchedPairs = Object.keys(matches).length;

    if (totalPairs > 0 && matchedPairs < totalPairs && matchedPairs > 0) {
      // User has made some matches but not completed all
      loseLife(
        `Incomplete answer: ${matchedPairs}/${totalPairs} pairs matched`,
        {
          totalPairs,
          matchedPairs,
          missingPairs: totalPairs - matchedPairs,
        },
      );
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
  }, [matches, leftItems, incorrectMatches]);

  // Remove match is now a no-op (disabled)
  const removeMatch = (leftId) => {
    // Do nothing
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
  // if (leftItems.length === 0 && rightItems.length === 0) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
  //         <div className="text-4xl mb-4">❌</div>
  //         <h3 className="text-lg font-semibold text-red-800 mb-2">
  //           Cannot Parse Match Pairs
  //         </h3>
  //         <p className="text-red-700 mb-4">
  //           The question data could not be parsed into matching pairs.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 mb-35">
      {/* Matching Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center border-b pb-2">
            Match These
          </h3>
          {leftItems.map((item) => {
            const matchStatus = getMatchStatus(item, true);
            const isSelected = selectedLeft?.id === item.id;
            const isDisabled = !!matches[item.id];

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => !isDisabled && handleLeftSelect(item)}
                  disabled={isDisabled}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    isDisabled
                      ? 'bg-[#696969] border-[#696969] text-white cursor-not-allowed opacity-70'
                      : isSelected
                        ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg transform scale-105'
                        : 'bg-[#7D32CE] text-white border-[#7D32CE] hover:bg-[#6B2BB0] hover:shadow-md hover:transform hover:scale-102'
                  }`}
                  title={isDisabled ? 'Matched' : 'Click to select'}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{item.text}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center border-b pb-2">
            With These
          </h3>
          {rightItems.map((item) => {
            const matchStatus = getMatchStatus(item, false);
            const isSelected = selectedRight?.id === item.id;
            const isDisabled = Object.values(matches).includes(item.id);

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => !isDisabled && handleRightSelect(item)}
                  disabled={isDisabled}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    isDisabled
                      ? 'bg-[#696969] border-[#696969] text-white cursor-not-allowed opacity-70'
                      : isSelected
                        ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg transform scale-105'
                        : 'bg-[#7D32CE] text-white border-[#7D32CE] hover:bg-[#6B2BB0] hover:shadow-md hover:transform hover:scale-102'
                  }`}
                  title={isDisabled ? 'Matched' : 'Click to select'}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{item.text}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      {Object.keys(matches).length === 0 && (
        <div className="text-center text-sm border border-[#696969] p-3 rounded-lg">
          Tip: Click one item from the top, then click its matching item on the
          bottom to create a pair.
        </div>
      )}
    </div>
  );
}
