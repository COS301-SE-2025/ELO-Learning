'use client';
import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQData {
  faqs: FAQ[];
}

interface OpenItems {
  [key: number]: boolean;
}

const faqData: FAQData = {
  faqs: [
    {
      question: 'What is ELO Learning?',
      answer:
        'ELO Learning is a math practice app that uses the same ranking system as chess grandmasters. It adapts to your skill level, gets smarter as you play, and helps you get better — not just score higher.',
    },
    {
      question: 'How does the ELO system work?',
      answer:
        "We use an adaptive ELO rating to match you with the right level of challenge. Win a 1v1 match? Your ELO score goes up. Struggle a bit? We adjust. It's not about being the best — it's about getting better, every time you play.\n\n- Ranked (1v1): Your ELO changes based on your opponent's level and the difficulty of the questions.\n- Single Player: Your score changes depending on how tough the questions are for your current level.\n- Practice Mode: No pressure — just skill-building. ELO stays the same, but your brain gets sharper.",
    },
    {
      question: 'Can I choose what kind of math to practice?',
      answer:
        'Yep! In Practice Mode, you can choose topics you want to work on — like algebra, geometry, and more.',
    },
    {
      question: 'What are the different game modes?',
      answer:
        '- Ranked (1v1): Go head-to-head in real time. Win, climb the ranks, flex.\n- Single Player: See how many questions you can crush in one round.\n- Practice Mode: Chill mode. No timers, no stress — just focused problem-solving.',
    },
    {
      question: 'Can I play with friends?',
      answer:
        "Not yet — but it's something we're planning to build. Right now, matchmaking is random and real-time.",
    },
    {
      question: 'Is this app safe?',
      answer:
        "Totally. There's no chat, messaging, or sharing. It's just you and the math.",
    },
    {
      question: 'What do I need to sign up?',
      answer:
        'Just your name, email, age, grade, username, and password. Easy.',
    },
    {
      question: 'I forgot my password. Help?',
      answer:
        "No worries — password reset is coming soon. For now, reach out to support and we'll get you back in.",
    },
    {
      question: 'Does my ELO ranking ever reset?',
      answer:
        'Nope — unless you delete your account, your ELO progress sticks with you.',
    },
    {
      question: 'Can I see my match history or progress?',
      answer:
        "Not yet — but that's on our roadmap! For now, you can track your rank by playing consistently.",
    },
    {
      question: 'How much does ELO Learning cost?',
      answer: 'Absolutely nothing. ELO Learning is free.',
    },
    {
      question: 'What devices can I use?',
      answer:
        'Any device with a browser works. ELO is a Progressive Web App (PWA), so it runs on phones, tablets, and computers.',
    },
    {
      question: 'Is there customer support?',
      answer:
        "Yep — real humans are here to help. If you've got a problem, question, or just want to share feedback, reach out through email at: zeroday0d4y@gmail.com",
    },
  ],
};

export default function Faq() {
  const [openItems, setOpenItems] = useState<OpenItems>({});

  const toggleItem = (index: number): void => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6 text-center">
        Frequently Asked Questions
      </h1>
      <div className="border border-[#696969] rounded-lg mx-3">
        <div className="">
          {faqData.faqs.map((faq, index) => (
            <div
              key={index}
              className={`overflow-hidden ${
                index < faqData.faqs.length - 1
                  ? 'border-b border-[#696969]'
                  : ''
              }`}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 py-3 text-left hover:bg-[#1d1a34] transition-colors duration-200 flex justify-between items-center"
              >
                <span className="font-medium">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    openItems[index] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openItems[index] && (
                <div className="px-4 py-3 border-t border-[#696969]">
                  <p className=" whitespace-pre-line">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
