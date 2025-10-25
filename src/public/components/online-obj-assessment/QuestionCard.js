'use client';

import PropTypes from 'prop-types';
import AnswerOption from './AnswerOptions';

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  isLastQuestion,
  showPrevious,
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {question.question}
        </h2>
        <p className="text-gray-600">
          Select the correct answer and click Next to continue
        </p>
      </div>
      <div className="p-6">
        {/* Display image if available */}
        {question.imageDataUrl && question.imageDataUrl.trim() !== '' && (
          <div className="mb-6 flex justify-center">
            <img
              src={question.imageDataUrl}
              alt="Question illustration"
              className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
              onError={(e) => {
                console.error('Failed to load image:', question.imageDataUrl);
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <AnswerOption
              key={`question-${question.id}-option-${index}`} /* eslint-disable-line react/no-array-index-key */
              option={option}
              index={index}
              questionId={question.id}
              isSelected={selectedAnswer === index}
              onSelect={onAnswerSelect}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedAnswer !== null
              ? 'Answer selected'
              : 'Please select an answer'}
          </div>
          <div className="flex items-center gap-3">
            {showPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                className="px-4 py-2 font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Previous
              </button>
            )}
            <button
            type="button"
            onClick={onNext}
            disabled={selectedAnswer === null}
            className={`px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedAnswer !== null
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.number.isRequired,
    imageDataUrl: PropTypes.string,
  }).isRequired,
  selectedAnswer: PropTypes.number,
  onAnswerSelect: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func,
  isLastQuestion: PropTypes.bool.isRequired,
  showPrevious: PropTypes.bool,
};

QuestionCard.defaultProps = {
  selectedAnswer: null,
  onPrevious: undefined,
  showPrevious: false,
};