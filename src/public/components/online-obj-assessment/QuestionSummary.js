'use client';

import PropTypes from 'prop-types';
import { User } from 'lucide-react';
import QuestionResult from './QuestionResult';

export default function QuestionSummary({ quizData, results, onResetQuiz }) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5" />
          Question Summary
        </h3>
        <p className="text-gray-600 mt-1">
          Review your answers and see the correct solutions
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {quizData.map((question, index) => {
            const userAnswer = results.answers.find(
              (a) => a.questionId === question.id,
            );
            return (
              <QuestionResult
                key={`question-result-${question.id}`}
                question={question}
                questionNumber={index + 1}
                userAnswer={userAnswer}
              />
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onResetQuiz}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    </div>
  );
}

QuestionSummary.propTypes = {
  quizData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      correctAnswer: PropTypes.number.isRequired,
    }),
  ).isRequired,
  results: PropTypes.shape({
    score: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
    answers: PropTypes.arrayOf(
      PropTypes.shape({
        questionId: PropTypes.number.isRequired,
        selectedOption: PropTypes.number.isRequired,
        isCorrect: PropTypes.bool.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  onResetQuiz: PropTypes.func.isRequired,
};