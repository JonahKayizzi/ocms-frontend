import { Award } from 'lucide-react';

export default function AssessmentCard() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">
      <div className="p-6 text-center">
        <Award className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Ready for Assessment?</h3>
        <p className="text-blue-100 mb-4">
          Test your knowledge and earn your certificate
        </p>
        <a
          href="/#"
          className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
        >
          <Award className="h-4 w-4" />
          <span>Take Assessment</span>
        </a>
      </div>
    </div>
  );
}
