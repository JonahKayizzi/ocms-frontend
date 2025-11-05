import { Award, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssessmentCard({ assessments = [], isEnrolled = false, canTake = false, participantId = '', attempts = [] }) {
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

  // Derive attempts info for this assessment
  const quizAttempts = (attempts || []).filter((a) => a?.quiz?.id === firstAssessment?.id);
  const attemptPercents = quizAttempts.map((a) => (a?.totalQuestions ? Math.round((a.score * 100) / a.totalQuestions) : 0));
  const bestPercent = attemptPercents.length ? Math.max(...attemptPercents) : 0;
  const maxRetries = Number(firstAssessment?.maxRetries || 0); // 0 means unlimited
  const currentCount = quizAttempts.length;
  const attemptsExhausted = maxRetries > 0 && currentCount >= maxRetries;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm">
      <div className="p-6 text-center">
        <Award className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Ready for Assessment?</h3>
        {quizAttempts.length > 0 && (
          <div className="mb-3 text-sm text-blue-100">
            <div className="mb-1">Previous scores: {attemptPercents.map((p) => `${p}%`).join(', ')}</div>
            {maxRetries > 0 && (
              <div>Attempts: {currentCount}/{maxRetries}</div>
            )}
          </div>
        )}
        {(!isEnrolled || !canTake) && (
          <p className="text-blue-100 mb-4">
            { !isEnrolled ? 'Enroll in the course to unlock the assessment.' : 'Complete 100% of the course to take the assessment.' }
          </p>
        )}
        {isEnrolled && canTake && !attemptsExhausted ? (
          <Link
            to={`/assessment/${firstAssessment.id}`}
            className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>{quizAttempts.length > 0 ? 'Retake Assessment' : 'Start Assessment'}</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white/40 text-white/80 font-medium rounded-md cursor-not-allowed"
            title={!isEnrolled ? 'Enroll required' : attemptsExhausted ? 'Attempts exhausted' : 'Complete course to 100%'}
          >
            <Lock className="h-4 w-4" />
            <span>{attemptsExhausted ? `Final Result: ${bestPercent}%` : 'Assessment Locked'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
