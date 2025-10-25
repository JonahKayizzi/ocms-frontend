import { Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssessmentCard({ assessments = [] }) {
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
        <p className="text-blue-100 mb-4">
          Test your knowledge and earn your certificate
        </p>
        <Link
          to={`/assessment/${firstAssessment.id}`}
          className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
        >
          <Award className="h-4 w-4" />
          <span>Take Assessment</span>
        </Link>
      </div>
    </div>
  );
}
