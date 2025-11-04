import { Award, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssessmentCard({ assessments = [], isEnrolled = false, canTake = false }) {
  // Get the first assessment if available
  const firstAssessment = assessments.length > 0 ? assessments[0] : null;

  if (!firstAssessment) {
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg shadow-sm">
        <div className="p-6 text-center">
          <Award className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Assessment Available</h3>
          <p className="text-gray-100 mb-4">
            Assessment will be available soon
          </p>
          <button
            disabled
            className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gray-300 text-gray-500 font-medium rounded-md cursor-not-allowed"
          >
            <Award className="h-4 w-4" />
            <span>Take Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">
      <div className="p-6 text-center">
        <Award className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Ready for Assessment?</h3>
        {(!isEnrolled || !canTake) && (
          <p className="text-blue-100 mb-4">
            { !isEnrolled ? 'Enroll in the course to unlock the assessment.' : 'Complete 100% of the course to take the assessment.' }
          </p>
        )}
        {isEnrolled && canTake ? (
          <Link
            to={`/assessment/${firstAssessment.id}`}
            className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>Start Assessment</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white/40 text-white/80 font-medium rounded-md cursor-not-allowed"
            title={!isEnrolled ? 'Enroll required' : 'Complete course to 100%'}
          >
            <Lock className="h-4 w-4" />
            <span>Assessment Locked</span>
          </button>
        )}
      </div>
    </div>
  );
}
