// app/ui/achievements/achievement-test.jsx (for testing purposes)
'use client';

export default function AchievementTest() {
  const testAchievements = [
    {
      id: 8,
      name: "Rising Star",
      description: "Reach an ELO rating of 3",
      condition_type: "ELO Rating Reached",
      condition_value: 3,
      AchievementCategories: { name: "ELO Rating" }
    },
    {
      id: 9,
      name: "Calculating Contender", 
      description: "Reach an ELO rating of 5",
      condition_type: "ELO Rating Reached",
      condition_value: 5,
      AchievementCategories: { name: "ELO Rating" }
    },
    {
      id: 1,
      name: "First Steps",
      description: "Answer your first question correctly",
      condition_type: "Questions Answered", 
      condition_value: 1,
      AchievementCategories: { name: "Gameplay" }
    },
    {
      id: 2,
      name: "Problem Solver",
      description: "Solve 10 problems correctly",
      condition_type: "Problems Solved",
      condition_value: 10, 
      AchievementCategories: { name: "Problem Solving" }
    }
  ];

  const testSingleAchievement = (achievement) => {
    if (typeof window !== 'undefined' && window.showAchievement) {
      window.showAchievement(achievement);
    } else {
      console.log('Achievement notification system not ready');
    }
  };

  const testMultipleAchievements = () => {
    if (typeof window !== 'undefined' && window.showMultipleAchievements) {
      // Test with first 3 achievements
      window.showMultipleAchievements(testAchievements.slice(0, 3));
    } else {
      console.log('Achievement notification system not ready');
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-white text-lg font-bold mb-4">
        🏆 Test Achievement Notifications
      </h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {testAchievements.map((achievement) => (
            <button
              key={achievement.id}
              onClick={() => testSingleAchievement(achievement)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Test {achievement.name}
            </button>
          ))}
        </div>
        
        <button
          onClick={testMultipleAchievements}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded font-medium transition-colors"
        >
          🎉 Test Multiple Achievements (Staggered)
        </button>
        
        <div className="text-gray-400 text-sm">
          <p>💡 Make sure you've added the AchievementNotificationManager to your layout first!</p>
        </div>
      </div>
    </div>
  );
}