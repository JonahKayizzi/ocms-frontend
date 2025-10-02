import PropTypes from 'prop-types';
import { CheckCircle, XCircle } from 'lucide-react';

export default function QuestionResult({
  question,
  questionNumber,
  userAnswer,
}) {
  const isCorrect = userAnswer?.isCorrect || false;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex-1">
          {questionNumber}
          .
          {question.question}
        </h4>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
            isCorrect
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {isCorrect ? 'Correct' : 'Incorrect'}
        </span>
      </div>

      <div className="grid gap-2">
        {question.options.map((option, optionIndex) => {
          const isUserAnswer = userAnswer?.selectedAnswer === optionIndex;
          const isCorrectAnswer = optionIndex === question.correctAnswer;

          let className = 'p-2 rounded border text-sm ';
          if (isCorrectAnswer) {
            className += 'bg-green-50 border-green-200 text-green-800';
          } else if (isUserAnswer && !isCorrectAnswer) {
            className += 'bg-red-50 border-red-200 text-red-800';
          } else {
            className += 'bg-gray-50 border-gray-200';
          }

          return (
            <div
              key={`question-${question.id}-result-option-${optionIndex}`} /* eslint-disable-line react/no-array-index-key */
              className={className}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                <div className="flex gap-1">
                  {isCorrectAnswer && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-200">
                      Correct
                    </span>
                  )}
                  {isUserAnswer && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                      Your Answer
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

QuestionResult.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.number.isRequired,
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  userAnswer: PropTypes.shape({
    questionId: PropTypes.number.isRequired,
    selectedAnswer: PropTypes.number.isRequired,
    isCorrect: PropTypes.bool.isRequired,
  }),
};

QuestionResult.defaultProps = {
  userAnswer: null,
};
