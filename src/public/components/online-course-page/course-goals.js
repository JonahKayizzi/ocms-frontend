/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';
import { Target, CheckCircle } from 'lucide-react';

export default function CourseGoals({ goals }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Learning Goals & Objectives
          </h2>
        </div>
      </div>
      <div className="p-6">
        <div className="grid gap-3">
          {goals.map((goal, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{goal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

CourseGoals.propTypes = {
  goals: PropTypes.arrayOf(PropTypes.string).isRequired,
};
