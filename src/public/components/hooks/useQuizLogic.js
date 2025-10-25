'use client';

import { useState, useEffect, useRef } from 'react';

export default function useQuizLogic(quizData, timingSettings = null) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [totalTime, setTotalTime] = useState(null);
  
  const timerRef = useRef(null);
  const quizStartTimeRef = useRef(null);

  const totalQuestions = quizData.length;

  // Initialize timing settings (only when settings change)
  useEffect(() => {
    if (timingSettings && timingSettings.timingMode !== 'none') {
      if (timingSettings.timingMode === 'quiz') {
        // Set timer for entire quiz (in minutes)
        const quizTimeInSeconds = timingSettings.timeLimit * 60;
        setTotalTime(quizTimeInSeconds);
        quizStartTimeRef.current = Date.now();
      } else if (timingSettings.timingMode === 'question') {
        // Set timer for current question (in seconds)
        setTotalTime(timingSettings.timeLimit);
      }
    } else {
      setTotalTime(null);
      setTimeRemaining(null);
    }
  }, [timingSettings]);

  // Start timer based on timing mode
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timingSettings && timingSettings.timingMode !== 'none' && totalTime !== null) {
      let shouldStartTimer = false;
      let initialTime = null;

      if (timingSettings.timingMode === 'quiz') {
        // For quiz timing, only start once when timeRemaining is null
        if (timeRemaining === null) {
          shouldStartTimer = true;
          initialTime = totalTime;
        }
      } else if (timingSettings.timingMode === 'question') {
        // For question timing, always reset on question change
        shouldStartTimer = true;
        initialTime = totalTime;
      }

      if (shouldStartTimer && initialTime !== null) {
        setTimeRemaining(initialTime);
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              setIsTimeUp(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timingSettings, totalTime, currentQuestion]); // Include currentQuestion for question timing mode

  // Handle time up
  useEffect(() => {
    if (isTimeUp) {
      if (timingSettings?.timingMode === 'quiz') {
        // Auto-submit entire quiz when time runs out
        submitQuiz();
      } else if (timingSettings?.timingMode === 'question') {
        // Auto-advance to next question when time runs out
        handleNext();
      }
      setIsTimeUp(false);
    }
  }, [isTimeUp]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);

    // Include the last answer
    const finalAnswers = {
      ...userAnswers,
      [quizData[currentQuestion].id]: selectedAnswer,
    };

    // Print user selections object to console
    console.log('=== USER SELECTIONS OBJECT ===');
    console.log('Raw user answers object:', finalAnswers);

    // Create detailed user selections for better readability
    const detailedUserSelections = quizData.map((question) => {
      const userAnswerIndex = finalAnswers[question.id];
      return {
        questionId: question.id,
        question: question.question,
        selectedAnswerIndex: userAnswerIndex,
        selectedAnswerText: question.options[userAnswerIndex],
        correctAnswerIndex: question.correctAnswer,
        correctAnswerText: question.options[question.correctAnswer],
        isCorrect: userAnswerIndex === question.correctAnswer,
      };
    });

    console.log('Detailed user selections:', detailedUserSelections);

    // Calculate quiz duration
    const quizDuration = quizStartTimeRef.current ? 
      Math.round((Date.now() - quizStartTimeRef.current) / 1000) : 0;

    // Prepare data for backend submission
    const backendSubmissionData = {
      userId: 'user_123', // This would come from authentication
      quizId: 'quiz_001', // This would be the quiz identifier
      startTime: new Date().toISOString(), // You'd track this from quiz start
      endTime: new Date().toISOString(),
      duration: quizDuration,
      answers: finalAnswers,
      detailedAnswers: detailedUserSelections,
      metadata: {
        totalQuestions,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        timingMode: timingSettings?.timingMode || 'none',
        timeLimit: timingSettings?.timeLimit || null,
      },
    };

    console.log('=== BACKEND SUBMISSION DATA ===');
    console.log('Data to be sent to backend:', backendSubmissionData);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate backend API call (this is where you'd make the actual HTTP request)
    console.log('=== SIMULATING BACKEND API CALL ===');
    console.log('POST /api/quiz/submit');
    console.log(
      'Request Body:',
      JSON.stringify(backendSubmissionData, null, 2),
    );

    // Calculate results
    const answersArray = quizData.map((question) => {
      const userAnswer = finalAnswers[question.id];
      return {
        questionId: question.id,
        selectedAnswer: userAnswer,
        isCorrect: userAnswer === question.correctAnswer,
      };
    });

    const correctAnswers = answersArray.filter(
      (answer) => answer.isCorrect,
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

    console.log('=== QUIZ RESULTS ===');
    console.log('Calculated results:', quizResults);

    setResults(quizResults);
    setIsQuizCompleted(true);
    setIsSubmitting(false);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      // Store the answer in the JavaScript object
      const updatedAnswers = {
        ...userAnswers,
        [quizData[currentQuestion].id]: selectedAnswer,
      };

      setUserAnswers(updatedAnswers);

      // Print current state of user selections
      console.log(`=== ANSWER STORED FOR QUESTION ${currentQuestion + 1} ===`);
      console.log(`Question ID: ${quizData[currentQuestion].id}`);
      console.log(`Selected Answer Index: ${selectedAnswer}`);
      console.log(
        `Selected Answer Text: "${quizData[currentQuestion].options[selectedAnswer]}"`,
      );
      console.log('Current user answers object:', updatedAnswers);
      console.log('---');

      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        
        // Reset timer for next question if in question mode
        if (timingSettings?.timingMode === 'question') {
          setTimeRemaining(timingSettings.timeLimit);
          setTotalTime(timingSettings.timeLimit);
        }
      } else {
        // Quiz completed, submit answers
        console.log('=== QUIZ COMPLETED - PREPARING SUBMISSION ===');
        submitQuiz();
      }
    }
  };

  const handlePrevious = () => {
    // Do not allow going back when timing per question is enforced
    if (timingSettings?.timingMode === 'question') return;

    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);

      // Restore previously selected answer if any
      const prevAnswer = userAnswers[quizData[prevIndex].id];
      setSelectedAnswer(typeof prevAnswer === 'number' ? prevAnswer : null);

      // If quiz had per-question timer (not allowed here), we'd also reset timer
      if (timingSettings?.timingMode === 'quiz') {
        // keep quiz timer running; no changes needed
      }
    }
  };

  const resetQuiz = () => {
    console.log('=== QUIZ RESET ===');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setIsQuizCompleted(false);
    setResults(null);
    setIsSubmitting(false);
    setIsTimeUp(false);
    quizStartTimeRef.current = Date.now();
    
    // Reset timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reinitialize timing
    if (timingSettings && timingSettings.timingMode !== 'none') {
      if (timingSettings.timingMode === 'quiz') {
        const quizTimeInSeconds = timingSettings.timeLimit * 60;
        setTimeRemaining(quizTimeInSeconds);
        setTotalTime(quizTimeInSeconds);
      } else if (timingSettings.timingMode === 'question') {
        setTimeRemaining(timingSettings.timeLimit);
        setTotalTime(timingSettings.timeLimit);
      }
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    if (timingSettings?.timingMode === 'quiz') {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    timingMode: timingSettings?.timingMode || 'none',
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    resetQuiz,
    formatTime,
  };
}