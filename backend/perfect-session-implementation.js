// Example implementation for Perfect Session achievement

// Add this to the end of a practice session in questions-tracker.jsx
const checkPerfectSession = async (questionsObj, userId) => {
  // Only check if we have exactly 10 questions (or whatever defines a "session")
  if (questionsObj.length >= 10) {
    const correctAnswers = questionsObj.filter((q) => q.isCorrect === true);

    if (correctAnswers.length === questionsObj.length) {
      console.log('🎯 Perfect session detected! All questions correct.');

      // Trigger Perfect Session achievement
      try {
        const { triggerAchievementProgress } = await import(
          '../achievementRoutes.js'
        );
        const result = await triggerAchievementProgress(
          userId,
          'Perfect Sessions',
          1,
        );

        if (result.unlockedAchievements.length > 0) {
          console.log('🏆 Perfect Session achievement unlocked!');
          // Show notification
          if (window.showMultipleAchievements) {
            window.showMultipleAchievements(result.unlockedAchievements);
          }
        }
      } catch (error) {
        console.error('Error checking Perfect Session achievement:', error);
      }
    }
  }
};

// Usage in questions-tracker.jsx handleQuizComplete():
const handleQuizComplete = async () => {
  const questionsObj = JSON.parse(localStorage.getItem('questionsObj') || '[]');

  // Check for perfect session achievement
  if (session?.user?.id) {
    await checkPerfectSession(questionsObj, session.user.id);
  }

  // Then navigate to end screen
  setTimeout(() => {
    router.push(`/end-screen?mode=${mode}`);
  }, 0);
};
