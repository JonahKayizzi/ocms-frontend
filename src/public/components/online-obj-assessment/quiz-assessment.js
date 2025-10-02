'use client';

import quizData from './data/quizData';

import useQuizLogic from '../hooks/useQuizLogic';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import LoadingScreen from './LoadingScreen';
import ResultsHeader from './ResultsHeader';
import QuestionSummary from './QuestionSummary';

export default function QuizAssessment() {
  const {
    currentQuestion,
    selectedAnswer,
    isQuizCompleted,
    results,
    isSubmitting,
    totalQuestions,
    handleAnswerSelect,
    handleNext,
    resetQuiz,
  } = useQuizLogic(quizData);

  if (isSubmitting) {
    return <LoadingScreen />;
  }

  if (isQuizCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <ResultsHeader results={results} />
          <QuestionSummary
            quizData={quizData}
            results={results}
            onResetQuiz={resetQuiz}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Progress Bar positioned below navbar */}
      <div className="w-full bg-gray-50 pt-4 mt-20">
        <div className="max-w-2xl mx-auto px-4">
          <ProgressBar
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="pt-2 px-4 pb-4 pt-16">
        <div className="max-w-2xl mx-auto">
          <QuestionCard
            question={quizData[currentQuestion]}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            isLastQuestion={currentQuestion === totalQuestions - 1}
          />
        </div>
      </div>
    </div>
  );
}
