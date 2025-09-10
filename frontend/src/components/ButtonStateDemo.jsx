import { SafeButton } from '@/components/SafeButton';
import { useState } from 'react';

/**
 * Demo component to showcase the improved button state management
 */
export const ButtonStateDemo = () => {
  const [results, setResults] = useState([]);

  const addResult = (message) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const simulateAsyncAction = async (delay = 1000, shouldFail = false) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    if (shouldFail) {
      throw new Error('Simulated error');
    }
    return 'Action completed successfully';
  };

  const handleQuickAction = async () => {
    addResult('Quick action started');
    await simulateAsyncAction(500);
    addResult('Quick action completed');
  };

  const handleRapidClickTest = async () => {
    addResult('Rapid click test action executed');
    await simulateAsyncAction(1000);
    addResult('Rapid click test completed');
  };

  const handleSlowAction = async () => {
    addResult('Slow action started');
    await simulateAsyncAction(2000);
    addResult('Slow action completed');
  };

  const handleErrorAction = async () => {
    addResult('Error action started');
    try {
      await simulateAsyncAction(1000, true);
    } catch (error) {
      addResult(`Error action failed: ${error.message}`);
      throw error; // Re-throw to let SafeButton handle it
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Button State Demo</h2>
      
      <div className="space-y-3 mb-6">
        <SafeButton
          onClick={handleRapidClickTest}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          loadingText="Processing..."
          buttonStateOptions={{ timeout: 200 }}
        >
          Rapid Click Test (Click rapidly!)
        </SafeButton>

        <SafeButton
          onClick={handleQuickAction}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          loadingText="Processing..."
        >
          Quick Action (500ms)
        </SafeButton>

        <SafeButton
          onClick={handleSlowAction}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          loadingText="Please wait..."
        >
          Slow Action (2s)
        </SafeButton>

        <SafeButton
          onClick={handleErrorAction}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          loadingText="Processing..."
        >
          Error Action
        </SafeButton>

        <button
          onClick={clearResults}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
        <h3 className="font-semibold mb-2">Action Log:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500">No actions performed yet</p>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Test Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Rapid Click Test:</strong> Click the orange button multiple times quickly - should execute only once</li>
          <li>Click buttons once - they should respond immediately</li>
          <li>Buttons should show loading state instantly</li>
          <li>No multiple clicks needed for response</li>
          <li>Extra rapid clicks should be ignored gracefully</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonStateDemo;
