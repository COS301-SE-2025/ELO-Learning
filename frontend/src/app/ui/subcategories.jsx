'use client';
import PracticeConfirmationPopup from '@/app/ui/pop-up/practice-confirmation';
import { useState } from 'react';

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-gray-500',
];

export default function SubCategories({ subcategories }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Handle topic selection - show confirmation modal instead of direct navigation
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setShowConfirmation(true);
  };

  // Handle keyboard navigation for topic selection
  const handleKeyDown = (event, topic) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTopicClick(topic);
    }
  };

  // Close the confirmation modal
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedTopic(null);
  };

  return (
    <>
      <div className="p-5">
        {subcategories.map((sub, idx) => (
          <div
            className="sub_categories flex flex-row items-center w-full p-4 gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--vector-violet)] focus:ring-offset-2 rounded-lg transition-all hover:scale-[1.02]"
            key={idx}
            onClick={() => handleTopicClick(sub)}
            onKeyDown={(e) => handleKeyDown(e, sub)}
            tabIndex={0}
            role="button"
            aria-label={`Start practice session for ${sub.name}. ${sub.description}`}
          >
            <div
              className={`flex items-center justify-center min-w-16 min-h-16 w-16 h-16 flex-shrink-0 rounded mr-4 text-2xl font-bold ${
                colors[idx % colors.length]
              }`}
              aria-hidden="true"
            >
              {sub.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{sub.name}</h2>
              <p className="text-sm">{sub.description}</p>
            </div>
            {/* <p className="text-lg ml-auto">{sub.completion}%</p> */}
          </div>
        ))}
      </div>

      {/* Practice Confirmation Modal */}
      <PracticeConfirmationPopup
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        topicName={selectedTopic?.name}
        topicId={selectedTopic?.topic_id}
      />
    </>
  );
}
