'use client';
// import { Shuffle } from 'lucide-react'; // Temporarily commented out
import { useEffect, useState } from 'react';

export default function MatchQuestionTemplate({ question, answers, setAnswer, setIsAnswerCorrect }) {
  console.log('🔥 MatchQuestionTemplate - COMPONENT CALLED!', { question, answers, setAnswer, setIsAnswerCorrect });
  
  // Quick test to see if component renders at all
  console.log('🔥 MatchQuestionTemplate - Component is mounting!');
  
  // Force render test - this should ALWAYS show something
  if (true) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-blue-800">🔥 Match Question Component Test</h3>
          <p className="text-blue-700">This component is working! Data received:</p>
          <div className="mt-2 text-sm">
            <p>• Question: {question?.questionText || 'No question text'}</p>
            <p>• Answers: {answers?.length || 0} answers</p>
            <p>• Question Type: {question?.type || 'No type'}</p>
          </div>
          {answers && answers.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Sample answer:</p>
              <p className="text-xs bg-white p-2 rounded">{JSON.stringify(answers[0], null, 2)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState({});
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);

  // Enhanced parsing function for match pairs
  const parsePairs = () => {
    console.log('Parsing pairs from answers:', answers);
    
    if (!answers || answers.length === 0) {
      console.warn('No answers provided for match question');
      return { left: [], right: [] };
    }

    const leftItems = [];
    const rightItems = [];
    
    // Handle different data formats
    answers.forEach((answer, index) => {
      console.log(`Processing answer ${index}:`, answer);
      
      let left, right;
      const answerText = typeof answer === 'string' ? answer : (answer.answer_text || answer.answerText || answer);
      
      // Method 1: Check if answer has explicit match_left and match_right fields
      if (answer.match_left && answer.match_right) {
        left = answer.match_left;
        right = answer.match_right;
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
        console.log(`✅ Added pair: "${left}" → "${right}"`);
      } else {
        console.warn(`❌ Failed to extract left/right from:`, answer);
      }
    });
    
    console.log('Parsed items:', { leftItems, rightItems });
    
    // Fallback: Create sample pairs if parsing failed
    if (leftItems.length === 0 && rightItems.length === 0) {
      console.warn('No pairs could be parsed. Creating fallback pairs...');
      
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
      
      console.log('✅ Created fallback pairs:', { leftItems, rightItems });
    }
    
    return { left: leftItems, right: rightItems };
  };

  // Initialize the match pairs
  useEffect(() => {
    console.log('Initializing match pairs...');
    const pairs = parsePairs();
    setLeftItems(pairs.left);
    
    // Shuffle right items to make it challenging
    const shuffledRight = [...pairs.right].sort(() => Math.random() - 0.5);
    setRightItems(shuffledRight);
    
    // Reset matches when answers change
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [answers, question]);

  // Handle selecting items for matching
  const handleLeftSelect = (item) => {
    console.log('Selected left item:', item);
    setSelectedLeft(item);
    if (selectedRight) {
      makeMatch(item, selectedRight);
    }
  };

  const handleRightSelect = (item) => {
    console.log('Selected right item:', item);
    setSelectedRight(item);
    if (selectedLeft) {
      makeMatch(selectedLeft, item);
    }
  };

  // Create a match between selected items
  const makeMatch = (leftItem, rightItem) => {
    console.log('Making match:', leftItem, '→', rightItem);
    
    const newMatches = {
      ...matches,
      [leftItem.id]: rightItem.id
    };
    setMatches(newMatches);
    setSelectedLeft(null);
    setSelectedRight(null);
    
    // Update parent components with match data
    setAnswer(newMatches);
    
    // Check if all items are matched
    const allMatched = leftItems.length > 0 && Object.keys(newMatches).length === leftItems.length;
    
    // For match questions, we need to validate if the matches are correct
    if (allMatched) {
      const isCorrect = validateMatches(newMatches);
      console.log('All matched, validation result:', isCorrect);
      setIsAnswerCorrect(isCorrect);
    } else {
      setIsAnswerCorrect(false);
    }
  };

  // Validate if the matches are correct
  const validateMatches = (currentMatches) => {
    console.log('Validating matches:', currentMatches);
    
    let correctCount = 0;
    const totalPairs = leftItems.length;
    
    for (const leftId in currentMatches) {
      const rightId = currentMatches[leftId];
      
      // Find the corresponding left and right items
      const leftItem = leftItems.find(item => item.id === leftId);
      const rightItem = rightItems.find(item => item.id === rightId);
      
      if (leftItem && rightItem) {
        // Check if they have the same pairId (meaning they're a correct match)
        if (leftItem.pairId === rightItem.pairId) {
          correctCount++;
          console.log(`✅ Correct match: ${leftItem.text} → ${rightItem.text}`);
        } else {
          console.log(`❌ Incorrect match: ${leftItem.text} → ${rightItem.text}`);
        }
      }
    }
    
    const isAllCorrect = correctCount === totalPairs;
    console.log(`Validation: ${correctCount}/${totalPairs} correct matches. All correct: ${isAllCorrect}`);
    
    return isAllCorrect;
  };

  // Remove a match
  const removeMatch = (leftId) => {
    console.log('Removing match for:', leftId);
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
    setAnswer(newMatches);
    setIsAnswerCorrect(false);
  };

  // Show feedback for current matches
  const getMatchFeedback = () => {
    if (Object.keys(matches).length === 0) return null;
    
    const totalMatches = Object.keys(matches).length;
    const totalPairs = leftItems.length;
    
    if (totalMatches === totalPairs) {
      const correctMatches = validateMatches(matches);
      return {
        type: correctMatches ? 'success' : 'error',
        message: correctMatches 
          ? '🎉 Perfect! All pairs matched correctly!' 
          : '❌ Some pairs are incorrect. Try again!'
      };
    }
    
    return {
      type: 'info',
      message: `Progress: ${totalMatches}/${totalPairs} pairs matched`
    };
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
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded">
            <p className="font-medium mb-2">Debug Information:</p>
            <p>Total answers: {answers?.length || 0}</p>
            <p>Sample answer: {JSON.stringify(answers?.[0], null, 2)}</p>
          </div>
        </div>
      </div>
    );
  }

  const feedback = getMatchFeedback();

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600">🔀</span>
          <span className="font-medium text-blue-800">Matching Instructions</span>
        </div>
        <p>Match each item on the left with the correct item on the right. Click one item from each side to create a match.</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-lg border ${
          feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          feedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <p className="font-medium">{feedback.message}</p>
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
            const isMatched = matches[item.id];
            const isSelected = selectedLeft?.id === item.id;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => isMatched ? removeMatch(item.id) : handleLeftSelect(item)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    isMatched
                      ? 'bg-green-100 border-green-400 text-green-800 cursor-pointer'
                      : isSelected
                        ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg'
                        : 'bg-white text-black border-gray-300 hover:border-[#7D32CE] hover:shadow-md'
                  }`}
                  title={isMatched ? 'Click to unmap' : 'Click to select'}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.text}</span>
                    {isMatched && (
                      <span className="text-green-600 text-sm">✓ Matched</span>
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
            const isMatched = Object.values(matches).includes(item.id);
            const isSelected = selectedRight?.id === item.id;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => isMatched ? null : handleRightSelect(item)}
                  disabled={isMatched}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    isMatched
                      ? 'bg-green-100 border-green-400 text-green-800 cursor-default'
                      : isSelected
                        ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg'
                        : 'bg-white text-black border-gray-300 hover:border-[#7D32CE] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{item.text}</span>
                    {isMatched && (
                      <span className="text-green-600 text-sm">✓ Matched</span>
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

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
          <p className="font-bold mb-2">Debug Info:</p>
          <p>Left items: {leftItems.length}</p>
          <p>Right items: {rightItems.length}</p>
          <p>Current matches: {JSON.stringify(matches, null, 2)}</p>
          <p>Validation result: {Object.keys(matches).length === leftItems.length ? validateMatches(matches).toString() : 'incomplete'}</p>
        </div>
      )}
    </div>
  );
}