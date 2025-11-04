"use client";

import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useGetAssessmentByIdQuery,
  useGetRandomQuestionsByAssessmentQuery,
} from "../../../redux/apiSlice";
import useQuizLogic from "../hooks/useQuizLogic";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import LoadingScreen from "./LoadingScreen";
import ResultsHeader from "./ResultsHeader";
import QuestionSummary from "./QuestionSummary";
import Timer from "./Timer";

export default function QuizAssessment() {
  const { id } = useParams();
  const assessmentId = Number(id);
  const [showIntroduction, setShowIntroduction] = useState(true);

  // Fetch assessment data to get settings
  const {
    data: assessment,
    isLoading: assessmentLoading,
    isError: assessmentError,
  } = useGetAssessmentByIdQuery(assessmentId, {
    skip: !assessmentId,
  });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Assessment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
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
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {assessment.name}
              </h1>
              <p className="text-lg text-gray-600">{assessment.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Quiz Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Quiz Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions to Attempt:</span>
                    <span className="font-medium">
                      {assessment.questionsToPresent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum Retries:</span>
                    <span className="font-medium">{assessment.maxRetries}</span>
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  Timing
                </h3>
                <div className="space-y-3">
                  {assessment.timingMode === "none" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Limit:</span>
                      <span className="font-medium text-green-600">
                        No Time Limit
                      </span>
                    </div>
                  )}
                  {assessment.timingMode === "quiz" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-medium text-orange-600">
                          {assessment.timeLimit} minutes
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Entire quiz must be completed within this time
                      </p>
                    </>
                  )}
                  {assessment.timingMode === "question" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Time per Question:
                        </span>
                        <span className="font-medium text-red-600">
                          {assessment.timeLimit} seconds
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Each question has a time limit
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                Instructions
              </h3>
              <ul className="text-gray-700 space-y-2">
                <li>
                  • Read each question carefully before selecting your answer
                </li>
                <li>
                  • You can change your answer before clicking "Next Question"
                </li>
                {assessment.timingMode !== "question" && (
                  <li>
                    • You can navigate back to previous questions using the
                    "Previous" button
                  </li>
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
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
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
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Time Warning Banner */}
      {showTimeWarning() && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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
      <div className="w-full bg-gray-50 pt-4 mt-20">
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
