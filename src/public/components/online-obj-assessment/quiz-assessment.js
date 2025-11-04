"use client";

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useGetAssessmentByIdQuery, useGetRandomQuestionsByAssessmentQuery, useIsEnrolledQuery } from '../../../redux/apiSlice';
import { getToken, getUsernameFromToken, isTokenExpired } from '../../../utils/jwtUtils';
import useQuizLogic from '../hooks/useQuizLogic';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import LoadingScreen from './LoadingScreen';
import ResultsHeader from './ResultsHeader';
import QuestionSummary from './QuestionSummary';
import Timer from './Timer';

export default function QuizAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assessmentId = Number(id);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Check authentication
  const token = getToken();
  const username = token ? getUsernameFromToken(token) : null;
  const isAuthenticated = token && !isTokenExpired(token);

  // Fetch assessment data to get settings
  const {
    data: assessment,
    isLoading: assessmentLoading,
    isError: assessmentError,
  } = useGetAssessmentByIdQuery(assessmentId, {
    skip: !assessmentId,
  });

  // Check enrollment if assessment belongs to a course
  const { data: enrollmentData } = useIsEnrolledQuery(
    { courseId: assessment?.courseId, participantId: username || '' },
    { skip: !assessment?.courseId || !username || !isAuthenticated }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!assessmentLoading && !isAuthenticated) {
      navigate('/login', { state: { warning: 'Please login to access assessments' } });
    }
  }, [assessmentLoading, isAuthenticated, navigate]);

  // Redirect to course page if assessment belongs to a course and user is not enrolled
  useEffect(() => {
    if (assessment && assessment.courseId && isAuthenticated && enrollmentData !== undefined) {
      if (!enrollmentData?.enrolled) {
        navigate(`/course/${assessment.courseId}`, { 
          state: { warning: 'Please enroll in the course to access this assessment' } 
        });
      }
    }
  }, [assessment, enrollmentData, isAuthenticated, navigate]);

  // Fetch random assessment questions from database
  const {
    data: questions = [],
    isLoading: questionsLoading,
    isError: questionsError,
  } = useGetRandomQuestionsByAssessmentQuery(
    {
      assessmentId,
      questionsToPresent: assessment?.questionsToPresent,
    },
    {
      skip: !assessmentId || !assessment,
    }
  );

  // Transform API data to quiz format with randomized questions and options
  const quizData = useMemo(() => {
    // Shuffle helper (Fisher–Yates)
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // First, randomize the order of questions
    const shuffledQuestions = shuffle([...questions]);

    return shuffledQuestions.map((question) => {
      const allOptions = Array.isArray(question.options)
        ? [...question.options]
        : [];
      // Identify the correct option
      const correctOption = allOptions.find(
        (opt) => opt && opt.isCorrect === true
      );
      const correctOptionText = correctOption ? correctOption.optionText : "";

      // Determine how many options to present (min 2, max total options)
      const totalNonEmpty = allOptions.filter(
        (o) =>
          o && typeof o.optionText === "string" && o.optionText.trim() !== ""
      ).length;
      const maxChoices = Math.max(
        2,
        Math.min(totalNonEmpty || 2, Number(question.optionsToPresent) || 2)
      );

      // Build candidate pool excluding correct first
      const distractors = allOptions
        .filter((o) => o && o.optionText && o.optionText.trim() !== "")
        .filter((o) => !o.isCorrect);

      const picked = [];
      // Always include correct option if available
      if (correctOption && correctOptionText) {
        picked.push(correctOptionText);
      }
      // Fill remaining slots with random distractors
      const need = Math.max(0, maxChoices - picked.length);
      const shuffledDistractors = shuffle(distractors)
        .slice(0, need)
        .map((o) => o.optionText);
      const limitedOptions = [...picked, ...shuffledDistractors];

      // Final shuffle so correct answer position is random
      const finalOptions = shuffle(limitedOptions);
      const correctIndex = finalOptions.findIndex(
        (t) => t === correctOptionText
      );

      return {
        id: question.id,
        question: question.text,
        options: finalOptions,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
        imageDataUrl: question.imageDataUrl || "",
      };
    });
  }, [questions]); // Only recalculate when questions change

  // Prepare timing settings - memoized to prevent unnecessary re-renders
  const timingSettings = useMemo(() => {
    if (!assessment) return null;
    return {
      timingMode: assessment.timingMode,
      timeLimit: assessment.timeLimit,
    };
  }, [assessment?.timingMode, assessment?.timeLimit]);

  const handleBackToIntro = () => {
    setShowIntroduction(true);
  };

  const {
    currentQuestion,
    selectedAnswer,
    isQuizCompleted,
    results,
    isSubmitting,
    totalQuestions,
    timeRemaining,
    isTimeUp,
    totalTime,
    timingMode,
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    resetQuiz: resetQuizLogic,
    formatTime,
    startQuiz,
  } = useQuizLogic(quizData, timingSettings);

  const resetQuiz = () => {
    resetQuizLogic();
    setShowIntroduction(true);
  };

  // Start quiz timer when user clicks "Start Quiz"
  const handleStartQuiz = () => {
    setShowIntroduction(false);
    startQuiz(); // Start the timer when quiz begins
  };

  // Show loading screen while fetching data
  if (assessmentLoading || questionsLoading) {
    return <LoadingScreen />;
  }

  // Show error if assessment not found
  if (assessmentError || questionsError || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all duration-300 border border-sky-200 dark:border-sky-500/20"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assessment Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The requested assessment could not be found or has no questions.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show introduction screen
  if (showIntroduction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all duration-300 border border-sky-200 dark:border-sky-500/20"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{assessment.name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{assessment.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Quiz Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Quiz Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Questions to Attempt:</span>
                    <span className="font-medium dark:text-white">{assessment.questionsToPresent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Maximum Retries:</span>
                    <span className="font-medium dark:text-white">{assessment.maxRetries}</span>
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">Timing</h3>
                <div className="space-y-3">
                  {assessment.timingMode === "none" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Time Limit:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">No Time Limit</span>
                    </div>
                  )}
                  {assessment.timingMode === "quiz" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Time Limit:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">{assessment.timeLimit} minutes</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Entire quiz must be completed within this time</p>
                    </>
                  )}
                  {assessment.timingMode === "question" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Time per Question:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">{assessment.timeLimit} seconds</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Each question has a time limit</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-3">Instructions</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Read each question carefully before selecting your answer</li>
                <li>• You can change your answer before clicking "Next Question"</li>
                {assessment.timingMode !== 'question' && (
                  <li>• You can navigate back to previous questions using the "Previous" button</li>
                )}
                {assessment.timingMode === "quiz" && (
                  <li>
                    • Keep track of the timer - the quiz will auto-submit when
                    time runs out
                  </li>
                )}
                {assessment.timingMode === "question" && (
                  <li>
                    • Each question has a time limit - you'll be moved to the
                    next question automatically
                  </li>
                )}
                <li>• Once you submit, you cannot change your answers</li>
                {assessment.maxRetries > 1 && (
                  <li>
                    • You have {assessment.maxRetries} attempts to complete this
                    quiz
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show retry warning if maxRetries is set and user has attempts remaining
  const showRetryWarning = assessment.maxRetries > 1;
  const remainingAttempts = assessment.maxRetries - 1; // Assuming this is the first attempt

  // Show time warning when 10% of time is left
  const showTimeWarning = () => {
    if (
      !timingSettings ||
      timingSettings.timingMode === "none" ||
      !timeRemaining ||
      !totalTime
    ) {
      return false;
    }
    const warningThreshold = totalTime * 0.1;
    return timeRemaining <= warningThreshold && timeRemaining > 0;
  };

  if (isSubmitting) {
    return <LoadingScreen />;
  }

  if (isQuizCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all duration-300 border border-sky-200 dark:border-sky-500/20"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <ResultsHeader results={results} />
          {/* Only show QuestionSummary if showAnswers is enabled */}
          {assessment.showAnswers && (
            <QuestionSummary
              quizData={quizData}
              results={results}
              onResetQuiz={resetQuiz}
            />
          )}
          {/* Show retry option if maxRetries allows it */}
          {assessment.maxRetries > 1 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={resetQuiz}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all duration-300 border border-sky-200 dark:border-sky-500/20"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>
      {/* Time Warning Banner */}
      {showTimeWarning() && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>⚠️ Time Warning:</strong>
                {timingMode === "quiz"
                  ? ` Only ${Math.ceil(
                      timeRemaining / 60
                    )} minute(s) remaining for the entire quiz!`
                  : ` Only ${timeRemaining} second(s) remaining for this question!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Retry Warning Banner */}
      {showRetryWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Quiz Attempts:</strong> You have {remainingAttempts}{" "}
                attempt(s) remaining after this one.
                {assessment.maxRetries === 1 && " This is your only attempt."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar positioned below navbar */}
      <div className="w-full bg-gray-50 dark:bg-slate-900 pt-4 mt-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <ProgressBar
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
            />
            <Timer
              timeRemaining={timeRemaining}
              timingMode={timingMode}
              formatTime={formatTime}
              isTimeUp={isTimeUp}
              totalTime={totalTime}
            />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="px-4 pb-4 pt-16">
        <div className="max-w-2xl mx-auto">
          <QuestionCard
            question={quizData[currentQuestion]}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={timingMode !== "question" && currentQuestion > 0}
            isLastQuestion={currentQuestion === totalQuestions - 1}
          />
        </div>
      </div>
    </div>
  );
}
