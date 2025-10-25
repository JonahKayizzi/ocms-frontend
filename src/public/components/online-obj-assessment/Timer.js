import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';

export default function Timer({ timeRemaining, timingMode, formatTime, isTimeUp, totalTime }) {
  if (timingMode === 'none') {
    return null;
  }
  
  // Show a test timer if timeRemaining is null but timingMode is not 'none'
  if (timeRemaining === null || timeRemaining === undefined) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
        <Clock className="h-4 w-4 mr-1" />
        <span>
          {timingMode === 'quiz' ? 'Quiz Time: ' : 'Question Time: '}
          {timingMode === 'quiz' ? '30:00' : '30s'}
        </span>
      </div>
    );
  }

  const getTimerColor = () => {
    if (isTimeUp) return 'text-red-600 bg-red-100';
    
    // Calculate 10% warning threshold
    const warningThreshold = totalTime ? totalTime * 0.1 : (timingMode === 'quiz' ? 30 : 3);
    
    if (timeRemaining <= warningThreshold) return 'text-red-600 bg-red-50';
    if (timeRemaining <= warningThreshold * 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const showWarning = () => {
    if (isTimeUp) return false;
    const warningThreshold = totalTime ? totalTime * 0.1 : (timingMode === 'quiz' ? 30 : 3);
    return timeRemaining <= warningThreshold;
  };

  return (
    <div className="flex flex-col items-end">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTimerColor()}`}>
        <Clock className="h-4 w-4 mr-1" />
        <span>
          {timingMode === 'quiz' ? 'Quiz Time: ' : 'Question Time: '}
          {formatTime ? formatTime(timeRemaining) : `${timeRemaining}s`}
        </span>
      </div>
      {showWarning() && (
        <div className="mt-1 text-xs text-red-600 font-medium">
          ⚠️ Time running out!
        </div>
      )}
    </div>
  );
}

Timer.propTypes = {
  timeRemaining: PropTypes.number,
  timingMode: PropTypes.string.isRequired,
  formatTime: PropTypes.func.isRequired,
  isTimeUp: PropTypes.bool,
  totalTime: PropTypes.number,
};
