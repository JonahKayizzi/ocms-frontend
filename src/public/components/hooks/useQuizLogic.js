"use client";

import { useState, useEffect, useRef } from "react";

export default function useQuizLogic(quizData, timingSettings = null, options = {}) {
  const { initialUserAnswers = null, initialCurrentQuestion = null } = options;
  const [currentQuestion, setCurrentQuestion] = useState(initialCurrentQuestion ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState(initialUserAnswers || {});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [totalTime, setTotalTime] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const timerRef = useRef(null);
  const quizStartTimeRef = useRef(null);
  const timerStartedRef = useRef(false); // Track if timer has been started for quiz mode
  const initialRestoreAppliedRef = useRef(false);

  const totalQuestions = quizData.length;

  // When resuming, apply initial state once; when switching to no initial (e.g. new attempt), reset
  useEffect(() => {
    const hasInitial = initialUserAnswers && Object.keys(initialUserAnswers).length > 0;
    if (!hasInitial) {
      if (initialRestoreAppliedRef.current) {
        setUserAnswers({});
        setCurrentQuestion(0);
        setSelectedAnswer(null);
      }
      initialRestoreAppliedRef.current = false;
      return;
    }
    if (initialRestoreAppliedRef.current || !quizData.length) return;
    initialRestoreAppliedRef.current = true;
    setUserAnswers(initialUserAnswers);
    const safeIdx = Math.min(
      initialCurrentQuestion ?? 0,
      Math.max(0, quizData.length - 1)
    );
    setCurrentQuestion(safeIdx);
    const q = quizData[safeIdx];
    if (q && q.id in initialUserAnswers) {
      setSelectedAnswer(initialUserAnswers[q.id]);
    }
  }, [initialUserAnswers, initialCurrentQuestion, quizData]);

  // Initialize timing settings (only when settings change)
  useEffect(() => {
    if (timingSettings && timingSettings.timingMode !== "none") {
      if (timingSettings.timingMode === "quiz") {
        // Set timer for entire quiz (in minutes)
        const quizTimeInSeconds = timingSettings.timeLimit * 60;
        setTotalTime(quizTimeInSeconds);
      } else if (timingSettings.timingMode === "question") {
        // Set default timer for questions (in seconds)
        setTotalTime(timingSettings.timeLimit);
      }
    } else {
      setTotalTime(null);
      setTimeRemaining(null);
    }
  }, [timingSettings]);

  // Start timer for quiz mode (only once, never restart)
  useEffect(() => {
    // Only start timer once when quiz starts and conditions are met
    if (
      !quizStarted ||
      !timingSettings ||
      timingSettings.timingMode !== "quiz" ||
      totalTime === null ||
      timerStartedRef.current
    ) {
      return;
    }

    // Ensure timeRemaining is set before starting timer
    if (timeRemaining === null) {
      setTimeRemaining(totalTime);
      return; // Wait for next render when timeRemaining is set
    }

    // Start the quiz timer only once - it will run continuously
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev === undefined) return prev;
        if (prev <= 1) {
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: only clear when component unmounts or quiz is reset
    // Don't clear on re-renders - timer should continue running
    return () => {
      // Only clear if quiz is explicitly reset or component unmounts
      // This cleanup is mainly for unmount, not for re-renders
      // The timer will be manually cleared in submitQuiz or resetQuiz
    };
    // Note: We intentionally don't include timeRemaining in dependencies
    // to prevent the effect from re-running every second
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, timingSettings?.timingMode, totalTime]);

  // Start timer for question mode (reset on question change)
  useEffect(() => {
    if (
      !quizStarted ||
      !timingSettings ||
      timingSettings.timingMode !== "question" ||
      totalTime === null
    ) {
      return;
    }

    // Clear existing timer for question mode
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset isTimeUp flag when moving to new question
    setIsTimeUp(false);

    // Get time limit for current question (use default from timing settings)
    const questionTimeLimit = totalTime;

    // Set timeRemaining for current question
    setTimeRemaining(questionTimeLimit);

    // Start new timer for current question
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev === undefined) return prev;
        if (prev <= 1) {
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    quizStarted,
    timingSettings?.timingMode,
    totalTime,
    currentQuestion,
    quizData,
  ]);

  // Handle time up
  useEffect(() => {
    if (isTimeUp) {
      if (timingSettings?.timingMode === "quiz") {
        // Auto-submit entire quiz when time runs out
        submitQuiz();
      } else if (timingSettings?.timingMode === "question") {
        // Auto-advance to next question when time runs out (even if no answer)
        // Or submit if on last question
        if (currentQuestion < totalQuestions - 1) {
          // Not last question - advance to next
          handleNext(true);
        } else {
          // Last question - submit quiz
          submitQuiz();
        }
      }
      setIsTimeUp(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeUp, timingSettings?.timingMode, currentQuestion, totalQuestions]);

  const handleAnswerSelect = (answer) => {
    // Handle both multiple choice (number) and structured (string) answers
    setSelectedAnswer(answer);
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);

    // Include the last answer
    const finalAnswers = {
      ...userAnswers,
      [quizData[currentQuestion].id]: selectedAnswer,
    };

    // Print user selections object to console
    console.log("=== USER SELECTIONS OBJECT ===");
    console.log("Raw user answers object:", finalAnswers);

    // Create detailed user selections for better readability
    const detailedUserSelections = quizData.map((question) => {
      const userAnswer = finalAnswers[question.id];
      const isStructured = question.questionType === "structured";

      return {
        questionId: question.id,
        question: question.question,
        questionType: question.questionType || "MCQ",
        selectedAnswerId: typeof userAnswer === "number" ? userAnswer : null,
        selectedAnswerText: isStructured
          ? typeof userAnswer === "string"
            ? userAnswer
            : null
          : typeof userAnswer === "number"
          ? question.options?.find((opt) => opt.id === userAnswer)?.optionText || null
          : null,
        correctAnswerId: question.correctAnswer,
        correctAnswerText:
          question.options?.find((opt) => opt.id === question.correctAnswer)?.optionText || null,
        isCorrect: isStructured ? false : userAnswer === question.correctAnswer, // Structured questions need manual grading
      };
    });

    console.log("Detailed user selections:", detailedUserSelections);

    // Calculate quiz duration
    const quizDuration = quizStartTimeRef.current
      ? Math.round((Date.now() - quizStartTimeRef.current) / 1000)
      : 0;

    // Prepare data for backend submission
    const backendSubmissionData = {
      userId: "user_123", // This would come from authentication
      quizId: "quiz_001", // This would be the quiz identifier
      startTime: new Date().toISOString(), // You'd track this from quiz start
      endTime: new Date().toISOString(),
      duration: quizDuration,
      answers: finalAnswers,
      detailedAnswers: detailedUserSelections,
      metadata: {
        totalQuestions,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        timingMode: timingSettings?.timingMode || "none",
        timeLimit: timingSettings?.timeLimit || null,
      },
    };

    console.log("=== BACKEND SUBMISSION DATA ===");
    console.log("Data to be sent to backend:", backendSubmissionData);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate backend API call (this is where you'd make the actual HTTP request)
    console.log("=== SIMULATING BACKEND API CALL ===");
    console.log("POST /api/quiz/submit");
    console.log(
      "Request Body:",
      JSON.stringify(backendSubmissionData, null, 2)
    );

    // Calculate results
    const answersArray = quizData.map((question) => {
      const userAnswer = finalAnswers[question.id];
      const isStructured = question.questionType === "structured";

      return {
        questionId: question.id,
        selectedAnswer: userAnswer,
        // For structured questions, include structuredAnswer field
        structuredAnswer:
          isStructured && typeof userAnswer === "string" ? userAnswer : null,
        isCorrect: isStructured ? false : userAnswer === question.correctAnswer, // Structured questions need manual grading
      };
    });

    const correctAnswers = answersArray.filter(
      (answer) => answer.isCorrect
    ).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const quizResults = {
      score: correctAnswers,
      totalQuestions,
      percentage,
      answers: answersArray,
      duration: quizDuration,
      timeUp: isTimeUp,
    };

    console.log("=== QUIZ RESULTS ===");
    console.log("Calculated results:", quizResults);

    setResults(quizResults);
    setIsQuizCompleted(true);
    setIsSubmitting(false);

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleNext = (forceAdvance = false) => {
    const currentQ = quizData[currentQuestion];
    const isStructured = currentQ?.questionType === "structured";

    // For structured questions, check if answer is not empty
    // For multiple choice, check if answer is not null
    const hasAnswer = isStructured
      ? selectedAnswer &&
        typeof selectedAnswer === "string" &&
        selectedAnswer.trim() !== "" &&
        selectedAnswer !== "<p><br></p>"
      : selectedAnswer !== null && selectedAnswer !== undefined;

    if (hasAnswer || forceAdvance) {
      const updatedAnswers = {
        ...userAnswers,
        [currentQ.id]: hasAnswer ? selectedAnswer : null,
      };

      setUserAnswers(updatedAnswers);

      console.log(`=== ANSWER STORED FOR QUESTION ${currentQuestion + 1} ===`);
      console.log(`Question ID: ${currentQ.id}`);
      console.log(
        `Question Type: ${currentQ.questionType || "MCQ"}`
      );
      if (isStructured) {
        console.log(
          `Structured Answer: ${hasAnswer ? "provided" : "none (timeout)"}`
        );
      } else {
        console.log(
          `Selected Answer ID: ${
            hasAnswer ? selectedAnswer : "none (timeout)"
          }`
        );
        if (hasAnswer) {
          const selectedOption = currentQ.options?.find((opt) => opt.id === selectedAnswer);
          console.log(
            `Selected Answer Text: "${selectedOption?.optionText || ""}"`
          );
        }
      }
      console.log("Current user answers object:", updatedAnswers);
      console.log("---");

      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);

        // For question mode, the timer will reset automatically via useEffect
        // For quiz mode, timer continues running - don't reset it
      } else {
        // Last question → submit
        console.log("=== QUIZ COMPLETED - PREPARING SUBMISSION ===");
        submitQuiz();
      }
    }
  };

  const handlePrevious = () => {
    // Do not allow going back when timing per question is enforced
    if (timingSettings?.timingMode === "question") return;

    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);

      // Restore previously selected answer (number for MCQ, string for structured)
      const prevAnswer = userAnswers[quizData[prevIndex].id];
      setSelectedAnswer(prevAnswer !== undefined && prevAnswer !== null ? prevAnswer : null);

      // If quiz had per-question timer (not allowed here), we'd also reset timer
      if (timingSettings?.timingMode === "quiz") {
        // keep quiz timer running; no changes needed
      }
    }
  };

  const resetQuiz = () => {
    console.log("=== QUIZ RESET ===");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setIsQuizCompleted(false);
    setResults(null);
    setIsSubmitting(false);
    setIsTimeUp(false);
    setQuizStarted(false);
    timerStartedRef.current = false;
    quizStartTimeRef.current = null;

    // Reset timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reinitialize timing
    if (timingSettings && timingSettings.timingMode !== "none") {
      if (timingSettings.timingMode === "quiz") {
        const quizTimeInSeconds = timingSettings.timeLimit * 60;
        setTimeRemaining(quizTimeInSeconds);
        setTotalTime(quizTimeInSeconds);
      } else if (timingSettings.timingMode === "question") {
        setTimeRemaining(timingSettings.timeLimit);
        setTotalTime(timingSettings.timeLimit);
      }
    }
  };

  // Function to start the quiz timer (called when quiz actually starts)
  const startQuiz = () => {
    setQuizStarted(true);
    if (timingSettings && timingSettings.timingMode !== "none") {
      if (timingSettings.timingMode === "quiz") {
        const quizTimeInSeconds = timingSettings.timeLimit * 60;
        setTotalTime(quizTimeInSeconds);
        setTimeRemaining(quizTimeInSeconds);
        quizStartTimeRef.current = Date.now();
      } else if (timingSettings.timingMode === "question") {
        setTotalTime(timingSettings.timeLimit);
        setTimeRemaining(timingSettings.timeLimit);
        quizStartTimeRef.current = Date.now();
      }
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    if (timingSettings?.timingMode === "quiz") {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return {
    currentQuestion,
    selectedAnswer,
    userAnswers,
    isQuizCompleted,
    results,
    isSubmitting,
    totalQuestions,
    timeRemaining,
    isTimeUp,
    totalTime,
    timingMode: timingSettings?.timingMode || "none",
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    resetQuiz,
    formatTime,
    startQuiz, // Export startQuiz function
  };
}
