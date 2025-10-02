'use client';

import { useState } from 'react';

export default function useQuizLogic(quizData) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = quizData.length;

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

    // Prepare data for backend submission
    const backendSubmissionData = {
      userId: 'user_123', // This would come from authentication
      quizId: 'quiz_001', // This would be the quiz identifier
      startTime: new Date().toISOString(), // You'd track this from quiz start
      endTime: new Date().toISOString(),
      answers: finalAnswers,
      detailedAnswers: detailedUserSelections,
      metadata: {
        totalQuestions,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
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
    };

    console.log('=== QUIZ RESULTS ===');
    console.log('Calculated results:', quizResults);

    setResults(quizResults);
    setIsQuizCompleted(true);
    setIsSubmitting(false);
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
      } else {
        // Quiz completed, submit answers
        console.log('=== QUIZ COMPLETED - PREPARING SUBMISSION ===');
        submitQuiz();
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
  };

  return {
    currentQuestion,
    selectedAnswer,
    userAnswers,
    isQuizCompleted,
    results,
    isSubmitting,
    totalQuestions,
    handleAnswerSelect,
    handleNext,
    resetQuiz,
  };
}
