import PropTypes from 'prop-types';

export default function ProgressCard({
  completion,
  lessonsCompleted,
  lessonsRemaining,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Course Completion</span>
              <span className="text-gray-900 font-medium">
                {completion}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {lessonsCompleted}
              </p>
              <p className="text-xs text-gray-600">Lessons Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {lessonsRemaining}
              </p>
              <p className="text-xs text-gray-600">Lessons Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProgressCard.propTypes = {
  completion: PropTypes.number.isRequired,
  lessonsCompleted: PropTypes.number.isRequired,
  lessonsRemaining: PropTypes.number.isRequired,
};
