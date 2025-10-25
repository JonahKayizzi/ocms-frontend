import PropTypes from 'prop-types';
import { Trophy } from 'lucide-react';

export default function ResultsHeader({ results }) {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 mt-24">
      <div className="text-center p-6">
        <div className="flex justify-center mb-4">
          <Trophy className="h-16 w-16 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quiz Completed!
        </h2>
        <p className="text-gray-600">Here are your results</p>
      </div>
      <div className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {results.score}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {results.percentage}
              %
            </div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {results.totalQuestions}
            </div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

ResultsHeader.propTypes = {
  results: PropTypes.shape({
    score: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
    answers: PropTypes.arrayOf(
      PropTypes.shape({
        questionId: PropTypes.string.isRequired,
        selectedOption: PropTypes.string,
        correct: PropTypes.bool,
      }),
    ).isRequired,
  }).isRequired,
};