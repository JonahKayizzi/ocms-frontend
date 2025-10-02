import { Clock } from 'lucide-react';
import PropTypes from 'prop-types';

export default function ProgressBar({ currentQuestion, totalQuestions }) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question
            {' '}
            {currentQuestion + 1}
            {' '}
            of
            {' '}
            {totalQuestions}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Quiz in Progress
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  currentQuestion: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
};
