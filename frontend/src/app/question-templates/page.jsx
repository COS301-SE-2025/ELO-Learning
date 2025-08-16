'use client';

import { BookOpen, Brain, Check, Layers, Target, X } from 'lucide-react';
import Link from 'next/link';

export default function QuestionTemplatesPage() {
  const questionTypes = [
    {
      id: 'multiple-choice',
      title: 'Multiple Choice',
      description: 'Select the correct answer from multiple options',
      icon: <Target size={32} />,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      hoverColor: 'hover:bg-blue-200',
      path: '/question-templates/multiple-choice',
    },
    {
      id: 'math-input',
      title: 'Math Input',
      description: 'Enter mathematical expressions and equations',
      icon: <Brain size={32} />,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      hoverColor: 'hover:bg-purple-200',
      path: '/question-templates/math-input',
    },
    {
      id: 'open-response',
      title: 'Open Response',
      description: 'Write detailed explanations and solutions',
      icon: <BookOpen size={32} />,
      color: 'bg-green-100 border-green-300 text-green-800',
      hoverColor: 'hover:bg-green-200',
      path: '/question-templates/open-response',
    },
    {
      id: 'expression-builder',
      title: 'Expression Builder',
      description: 'Build mathematical expressions using tiles',
      icon: <Layers size={32} />,
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      hoverColor: 'hover:bg-orange-200',
      path: '/question-templates/expression-builder',
    },
    {
      id: 'match-question',
      title: 'Match Question',
      description: 'Connect related items by matching pairs',
      icon: <span style={{ fontSize: '32px' }}>🔗</span>,
      color: 'bg-pink-100 border-pink-300 text-pink-800',
      hoverColor: 'hover:bg-pink-200',
      path: '/question-templates/match-question',
    },
    {
      id: 'true-false',
      title: 'True/False',
      description: 'Determine if statements are true or false',
      icon: (
        <div className="flex gap-1">
          <Check size={16} />
          <X size={16} />
        </div>
      ),
      color: 'bg-red-100 border-red-300 text-red-800',
      hoverColor: 'hover:bg-red-200',
      path: '/question-templates/true-false',
    },
    {
      id: 'mixed',
      title: 'Mixed Practice',
      description: 'Practice with a variety of question types',
      icon: <Target size={32} />,
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      hoverColor: 'hover:bg-indigo-200',
      path: '/question-templates/mixed',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Question Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice with different types of questions to improve your
            mathematical skills. Each template offers a unique way to engage
            with learning content.
          </p>
        </div>

        {/* Question Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {questionTypes.map((type) => (
            <Link key={type.id} href={type.path}>
              <div
                className={`${type.color} ${type.hoverColor}
                  border-2 rounded-xl p-6 transition-all duration-200
                  hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md">
                    {type.icon}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2">{type.title}</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            How to Use Question Templates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Choose a Type</h3>
              <p className="text-gray-600">
                Select the question template that matches your learning goals or
                what you want to practice.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Practice</h3>
              <p className="text-gray-600">
                Work through the questions at your own pace. Each type offers
                unique interaction methods.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Learn & Improve</h3>
              <p className="text-gray-600">
                Get instant feedback and explanations to help you understand and
                improve your skills.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D32CE] text-white rounded-lg hover:bg-[#6B2AB8] transition-colors"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    </div>
  );
}
