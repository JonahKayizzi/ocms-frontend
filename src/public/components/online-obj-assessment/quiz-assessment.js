"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  useGetAssessmentByIdQuery,
  useGetRandomQuestionsByAssessmentQuery,
  useIsEnrolledQuery,
  useStartQuizAttemptMutation,
  useRecordQuizAnswerMutation,
  useFinishQuizAttemptMutation,
  useGetUserQuizAttemptsQuery,
  useLazyGetQuizAttemptByIdQuery,
} from "../../../redux/apiSlice";
import {
  getToken,
  getUsernameFromToken,
  isTokenExpired,
} from "../../../utils/jwtUtils";
import useQuizLogic from "../hooks/useQuizLogic";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import LoadingScreen from "./LoadingScreen";
import ResultsHeader from "./ResultsHeader";
import QuestionSummary from "./QuestionSummary";
import Timer from "./Timer";

export default function QuizAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assessmentId = Number(id);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [attemptId, setAttemptId] = useState(null);
  const [restoredUserAnswers, setRestoredUserAnswers] = useState(null);
  const [restoredCurrentQuestion, setRestoredCurrentQuestion] = useState(null);
  const [startAttempt] = useStartQuizAttemptMutation();
  const [recordAnswer] = useRecordQuizAnswerMutation();
  const [finishAttempt] = useFinishQuizAttemptMutation();
  const [fetchAttemptById] = useLazyGetQuizAttemptByIdQuery();
  const persistedRef = useRef(false);
  const restoredAttemptRef = useRef(false);
  const restoredForAttemptIdRef = useRef(null);

  // (moved below after useQuizLogic to avoid referencing variables before initialization)

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

  // Fetch user attempts to compute attempts left
  const { data: userAttempts = [], refetch: refetchAttempts } =
    useGetUserQuizAttemptsQuery(username || "", {
      skip: !username,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  // Always recheck attempts when intro is visible or tab/window gains focus
  useEffect(() => {
    if (showIntroduction && username) {
      try {
        refetchAttempts();
      } catch (_) {
        /* noop */
      }
    }
  }, [showIntroduction, username, assessmentId, refetchAttempts]);

  useEffect(() => {
    const onFocus = () => {
      if (username) {
        try {
          refetchAttempts();
        } catch (_) {
          /* noop */
        }
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [username, refetchAttempts]);

  // Detect in-progress attempt and restore state (survives refresh, tab close, etc.)
  useEffect(() => {
    if (
      !username ||
      !assessmentId ||
      !Array.isArray(userAttempts) ||
      userAttempts.length === 0
    )
      return;
    const inProgress = userAttempts.find(
      (a) => a?.quiz?.id === assessmentId && a?.completedAt == null
    );
    if (!inProgress?.id) return;
    if (restoredForAttemptIdRef.current === inProgress.id) return;
    restoredForAttemptIdRef.current = inProgress.id;
    (async () => {
      try {
        const details = await fetchAttemptById(inProgress.id).unwrap();
        const performances =
          details?.questionPerformances || details?.answers || [];
        const userAnswersMap = {};
        performances.forEach((p) => {
          const qId = p.questionId;
          const isStructured =
            (p.questionType || "").toLowerCase() === "structured";
          userAnswersMap[qId] = isStructured
            ? p.answerText ?? p.structuredAnswer ?? null
            : p.selectedAnswerId != null
            ? p.selectedAnswerId
            : null;
        });
        // Use number of answered questions as starting index; hook will clamp to available questions
        const nextIndex = performances.length;
        setRestoredUserAnswers(userAnswersMap);
        setRestoredCurrentQuestion(nextIndex);
        setAttemptId(inProgress.id);
        setShowIntroduction(false);
        restoredAttemptRef.current = true;
      } catch (_) {
        restoredForAttemptIdRef.current = null;
        /* ignore; user can start new attempt */
      }
    })();
  }, [username, assessmentId, userAttempts, fetchAttemptById]);

  // Check enrollment if assessment belongs to a course
  const { data: enrollmentData } = useIsEnrolledQuery(
    { courseId: assessment?.courseId, participantId: username || "" },
    { skip: !assessment?.courseId || !username || !isAuthenticated }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!assessmentLoading && !isAuthenticated) {
      navigate("/login", {
        state: { warning: "Please login to access assessments" },
      });
    }
  }, [assessmentLoading, isAuthenticated, navigate]);

  // Redirect to course page if assessment belongs to a course and user is not enrolled
  useEffect(() => {
    if (
      assessment &&
      assessment.courseId &&
      isAuthenticated &&
      enrollmentData !== undefined
    ) {
      if (!enrollmentData?.enrolled) {
        navigate(`/course/${assessment.courseId}`, {
          state: {
            warning: "Please enroll in the course to access this assessment",
          },
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
      // Detect question type: check questionType field first, then fallback to checking if options exist
      const hasOptions =
        Array.isArray(question.options) && question.options.length > 0;
      const questionType =
        question.questionType ||
        (hasOptions ? "MCQ" : "structured");

      // For structured questions, return simpler format
      if (questionType === "structured") {
        return {
          id: question.id,
          question: question.text,
          options: [], // No options for structured questions
          correctAnswer: null, // No correct answer for structured (needs manual grading)
          imageDataUrl: question.imageDataUrl || "",
          questionType: "structured",
        };
      }

      // For multiple choice questions, keep option IDs so backend stores actual option PK.
      const allOptions = Array.isArray(question.options)
        ? [...question.options]
        : [];
      // Identify the correct option
      const correctOption = allOptions.find(
        (opt) => opt && opt.isCorrect === true
      );
      const correctOptionText = correctOption ? correctOption.optionText : "";
      const correctOptionId = correctOption ? correctOption.id : null;

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
        picked.push(correctOption);
      }
      // Fill remaining slots with random distractors
      const need = Math.max(0, maxChoices - picked.length);
      const shuffledDistractors = shuffle(distractors)
        .slice(0, need);
      const limitedOptions = [...picked, ...shuffledDistractors];

      // Final shuffle so correct answer position is random
      const finalOptions = shuffle(limitedOptions);

      return {
        id: question.id,
        question: question.text,
        options: finalOptions,
        correctAnswer: correctOptionId,
        imageDataUrl: question.imageDataUrl || "",
        questionType: "MCQ",
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
    handleNext: handleNextBase,
    handlePrevious,
    resetQuiz: resetQuizLogic,
    formatTime,
    startQuiz,
  } = useQuizLogic(quizData, timingSettings, {
    initialUserAnswers: restoredUserAnswers,
    initialCurrentQuestion: restoredCurrentQuestion,
  });

  // When we restored, start the quiz timer (runs after useQuizLogic is initialized)
  useEffect(() => {
    if (attemptId && !showIntroduction && restoredAttemptRef.current && startQuiz) {
      startQuiz();
      restoredAttemptRef.current = false;
    }
  }, [attemptId, showIntroduction, startQuiz]);

  // Persist current answer to backend when moving to next (survives refresh/interruption)
  const handleNext = async (forceAdvance = false) => {
    const currentQ = quizData[currentQuestion];
    if (attemptId && username && currentQ) {
      const isStructured = currentQ?.questionType === "structured";
      const hasAnswer = isStructured
        ? selectedAnswer != null && String(selectedAnswer).trim() !== "" && selectedAnswer !== "<p><br></p>"
        : selectedAnswer != null && selectedAnswer !== undefined;
      if (hasAnswer || forceAdvance) {
        try {
          await recordAnswer({
            attemptId,
            questionId: currentQ.id,
            answerId: isStructured ? null : selectedAnswer,
            participantId: username,
            correct: !isStructured && selectedAnswer === currentQ.correctAnswer,
            structuredAnswer: isStructured ? (hasAnswer ? selectedAnswer : null) : null,
          }).unwrap();
        } catch (_) {
          /* non-blocking; will retry on finish */
        }
      }
    }
    handleNextBase(forceAdvance);
  };

  // Persist answers and finalize attempt once when quiz is completed
  useEffect(() => {
    if (!isQuizCompleted || !results || !attemptId || !username) return;
    if (persistedRef.current) return;
    persistedRef.current = true;
    (async () => {
      try {
        for (const ans of results.answers || []) {
          // Find the question to determine its type
          const question = quizData.find((q) => q.id === ans.questionId);
          const isStructured = question?.questionType === "structured";

          await recordAnswer({
            attemptId,
            questionId: ans.questionId,
            answerId: isStructured ? null : ans.selectedAnswer,
            participantId: username,
            correct: !!ans.isCorrect,
            structuredAnswer: isStructured ? ans.selectedAnswer : null,
          }).unwrap();
        }
        await finishAttempt({ attemptId }).unwrap();
        // Note: We no longer auto-redirect on last attempt - users should be able to view their results
        // They can navigate away manually when ready
      } catch (err) {
        // ignore persistence errors; UI already shows results
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuizCompleted, results, attemptId, username]);

  const resetQuiz = () => {
    resetQuizLogic();
    setShowIntroduction(true);
    setAttemptId(null);
    setRestoredUserAnswers(null);
    setRestoredCurrentQuestion(null);
    persistedRef.current = false;
  };

  // Start quiz timer when user clicks "Start Quiz"
  const handleStartQuiz = async () => {
    // Local guard using attempts left - count only COMPLETED attempts
    const attemptsForThis = Array.isArray(userAttempts)
      ? userAttempts.filter((a) => a?.quiz?.id === assessmentId && a?.completedAt).length
      : 0;
    const maxRetries = assessment?.maxRetries || 0;
    if (maxRetries > 0 && attemptsForThis >= maxRetries) {
      window.alert("Maximum attempts reached");
      return;
    }
    try {
      setRestoredUserAnswers(null);
      setRestoredCurrentQuestion(null);
      if (username && assessmentId) {
        const resp = await startAttempt({
          quizId: assessmentId,
          participantId: username,
        }).unwrap();
        setAttemptId(resp.attemptId);
      }
    } catch (e) {
      const status = e?.status || 0;
      const msg = e?.data?.message || "Unable to start attempt";
      if (status === 403) {
        window.alert(msg || "Maximum attempts reached");
        return; // Block starting the quiz
      }
      // Other errors: allow quiz UI but won’t persist
    }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Assessment Not Found
          </h2>
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
    // Count only COMPLETED attempts for this assessment (attempts with completedAt)
    const attemptsForThis = Array.isArray(userAttempts)
      ? userAttempts.filter((a) => a?.quiz?.id === assessmentId && a?.completedAt).length
      : 0;
    // Calculate attempts remaining: maxRetries - completed attempts
    // (This is before starting, so we don't subtract 1)
    const attemptsLeft =
      assessment?.maxRetries > 0
        ? Math.max((assessment?.maxRetries || 0) - attemptsForThis, 0)
        : null;
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {assessment.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {assessment.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Quiz Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                  Quiz Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Total Questions:
                    </span>
                    <span className="font-medium dark:text-white">
                      {totalQuestions || assessment.questionsToPresent || 0}
                    </span>
                  </div>
                  {/* Show MCQ and Structured question counts */}
                  {(() => {
                    const mcqCount = quizData.filter(q => q.questionType === "MCQ" || (q.options && q.options.length > 0)).length;
                    const structuredCount = quizData.filter(q => q.questionType === "structured" || (!q.options || q.options.length === 0)).length;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">
                            Multiple Choice Questions:
                          </span>
                          <span className="font-medium dark:text-white">
                            {mcqCount}
                          </span>
                        </div>
                        {structuredCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Structured Questions:
                            </span>
                            <span className="font-medium dark:text-white">
                              {structuredCount}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Maximum Retries:
                    </span>
                    <span className="font-medium dark:text-white">
                      {assessment.maxRetries}
                    </span>
                  </div>
                  {attemptsLeft !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Attempts Left:
                      </span>
                      <span
                        className={`font-medium ${
                          attemptsLeft === 0
                            ? "text-red-400"
                            : "dark:text-white"
                        }`}
                      >
                        {attemptsLeft}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timing Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">
                  Timing
                </h3>
                <div className="space-y-3">
                  {assessment.timingMode === "none" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Time Limit:
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        No Time Limit
                      </span>
                    </div>
                  )}
                  {assessment.timingMode === "quiz" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Time Limit:
                        </span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {assessment.timeLimit} minutes
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Entire quiz must be completed within this time
                      </p>
                    </>
                  )}
                  {assessment.timingMode === "question" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Time per Question:
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {assessment.timeLimit} seconds
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Each question has a time limit. Structured questions may
                        have individual time limits set by the admin.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-3">
                Instructions
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>
                  • Read each question carefully before selecting your answer
                </li>
                <li>
                  • You can change your answer before clicking "Next Question"
                </li>
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
                <li>• Your answers are saved as you go; if you refresh or leave, you can return and resume</li>
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
                disabled={assessment?.maxRetries > 0 && attemptsLeft === 0}
                className={`px-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium ${
                  assessment?.maxRetries > 0 && attemptsLeft === 0
                    ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                }`}
                title={
                  assessment?.maxRetries > 0 && attemptsLeft === 0
                    ? "Attempts exhausted"
                    : "Start Quiz"
                }
              >
                {assessment?.maxRetries > 0 && attemptsLeft === 0
                  ? "Attempts Exhausted"
                  : "Start Quiz"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate attempts remaining for retry warning (during quiz)
  // Count only COMPLETED attempts for this assessment (attempts with completedAt)
  const attemptsForThisQuiz = Array.isArray(userAttempts)
    ? userAttempts.filter((a) => a?.quiz?.id === assessmentId && a?.completedAt).length
    : 0;
  // Calculate remaining: maxRetries - completed attempts - 1 (for current attempt)
  const remainingAttempts = assessment?.maxRetries > 0
    ? Math.max((assessment?.maxRetries || 0) - attemptsForThisQuiz - 1, 0)
    : null;
  const showRetryWarning = assessment?.maxRetries > 1 && remainingAttempts !== null && remainingAttempts > 0;

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
          <ResultsHeader results={results} quizData={quizData} />
          {/* Only show QuestionSummary if showAnswers is enabled */}
          {assessment.showAnswers && (
            <QuestionSummary
              quizData={quizData}
              results={results}
              onResetQuiz={resetQuiz}
            />
          )}
          {/* Show retry option if maxRetries allows it and user has attempts remaining */}
          {(() => {
            // Count only COMPLETED attempts for this assessment (attempts with completedAt)
            const attemptsForThis = Array.isArray(userAttempts)
              ? userAttempts.filter((a) => a?.quiz?.id === assessmentId && a?.completedAt).length
              : 0;
            const maxRetries = assessment?.maxRetries || 0;
            const attemptsLeft = maxRetries > 0 ? Math.max(maxRetries - attemptsForThis - 1, 0) : 999;
            const isLastAttempt = maxRetries > 0 && attemptsLeft === 0;
            
            if (isLastAttempt) {
              return (
                <div className="mt-6 text-center">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-4 rounded-md mb-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Maximum attempts reached.</strong> This was your final attempt. You can view your results above.
                    </p>
                  </div>
                </div>
              );
            }
            
            if (assessment.maxRetries > 1 && attemptsLeft > 0) {
              return (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Retake Quiz ({attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining)
                  </button>
                </div>
              );
            }
            
            return null;
          })()}
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
              totalTime={
                // For per-question mode, use the default time limit
                totalTime
              }
            />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="px-4 pb-4 pt-16">
        <div className="max-w-2xl mx-auto">
          <QuestionCard
            key={quizData[currentQuestion]?.id}
            question={quizData[currentQuestion]}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            isLastQuestion={currentQuestion === totalQuestions - 1}
            questionType={
              quizData[currentQuestion]?.questionType ||
              (quizData[currentQuestion]?.options?.length > 0
                ? "MCQ"
                : "structured")
            }
          />
        </div>
      </div>
    </div>
  );
}
