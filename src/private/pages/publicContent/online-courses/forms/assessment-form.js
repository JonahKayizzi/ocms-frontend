import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Plus, Edit, Trash2, Search, Filter, X } from "lucide-react";
import QuestionForm from "./question-form";
import {
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useCreateBulkOptionsMutation,
  useGetQuestionsByAssessmentQuery,
  useGetOptionsByQuestionQuery,
} from "../../../../../redux/apiSlice";

export default function AssessmentForm({
  assessment,
  onSave,
  onCancel,
  courseId,
}) {
  const [name, setName] = useState(assessment?.name || "");
  const [description, setDescription] = useState(assessment?.description || "");
  const [questionsToPresent, setQuestionsToPresent] = useState(
    assessment?.questionsToPresent || 0
  );
  const [showAnswers, setShowAnswers] = useState(
    assessment?.showAnswers !== undefined ? assessment.showAnswers : true
  );
  const [maxRetries, setMaxRetries] = useState(
    assessment?.maxRetries !== undefined ? assessment.maxRetries : 3
  );
  const [timingMode, setTimingMode] = useState(
    assessment?.timingMode || "none"
  );
  const [timeLimit, setTimeLimit] = useState(
    assessment?.timeLimit !== undefined ? assessment.timeLimit : 30
  );
  const [passMark, setPassMark] = useState(
    assessment?.passMark !== undefined ? assessment.passMark : 70
  );
  const [isAim, setIsAim] = useState(
    assessment?.isAim !== undefined ? assessment.isAim : false
  );
  const [questionBank, setQuestionBank] = useState(
    assessment?.questionBank || []
  );
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all", "multiple_choice", "structured"
  const [filterMandatory, setFilterMandatory] = useState("all"); // "all", "mandatory", "non-mandatory"
  const [filterHasImage, setFilterHasImage] = useState("all"); // "all", "yes", "no"
  const [questionOptions, setQuestionOptions] = useState({}); // { questionId: { options: [], correctAnswer: "" } }

  // RTK Query mutations
  const [createAssessment] = useCreateAssessmentMutation();
  const [updateAssessment] = useUpdateAssessmentMutation();
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [createBulkOptions] = useCreateBulkOptionsMutation();

  // Fetch existing questions when editing
  const {
    data: existingQuestionsData,
    refetch: refetchQuestions,
    error: questionsError,
  } = useGetQuestionsByAssessmentQuery(assessment?.id, {
    skip: !assessment?.id,
  });
  const existingQuestions = React.useMemo(
    () => existingQuestionsData || [],
    [existingQuestionsData]
  );

  // Load options for all questions when questions are loaded
  useEffect(() => {
    const loadQuestionOptions = async () => {
      if (existingQuestions.length === 0) return;
      
      const optionsMap = {};
      await Promise.all(
        existingQuestions.map(async (q) => {
          if (q.id && typeof q.id === "number") {
            try {
              const response = await fetch(
                `${
                  process.env.REACT_APP_API_URL || "http://localhost:8091"
                }/question-options/question/${q.id}`
              );
              if (response.ok) {
                const options = await response.json();
                const correctOption = options.find((opt) => opt.isCorrect === true);
                optionsMap[q.id] = {
                  options: options,
                  correctAnswer: correctOption ? correctOption.optionText : "",
                  optionCount: options.length,
                };
              } else {
                optionsMap[q.id] = {
                  options: [],
                  correctAnswer: "",
                  optionCount: 0,
                };
              }
            } catch (error) {
              console.error(`Error loading options for question ${q.id}:`, error);
              optionsMap[q.id] = {
                options: [],
                correctAnswer: "",
                optionCount: 0,
              };
            }
          }
        })
      );
      setQuestionOptions(optionsMap);
    };

    if (assessment?.id && existingQuestions.length > 0) {
      loadQuestionOptions();
    }
  }, [existingQuestions, assessment?.id]);

  useEffect(() => {
    if (assessment) {
      setName(assessment.name);
      setDescription(assessment.description);
      setQuestionsToPresent(assessment.questionsToPresent);
      setShowAnswers(assessment.showAnswers !== undefined ? assessment.showAnswers : true);
      setMaxRetries(assessment.maxRetries !== undefined ? assessment.maxRetries : 3);
      setTimingMode(assessment.timingMode || "none");
      setTimeLimit(assessment.timeLimit !== undefined ? assessment.timeLimit : 30);
      setPassMark(assessment.passMark !== undefined ? assessment.passMark : 70);
      setIsAim(assessment.isAim !== undefined ? assessment.isAim : false);

      // Load existing questions from API if available, otherwise use assessment.questionBank
      if (existingQuestions.length > 0) {
        // Convert API questions to form format
        const formattedQuestions = existingQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          correctAnswer: "",
          optionsToPresent: q.optionsToPresent || 4,
          imageDataUrl: q.imageDataUrl || "",
          optionalAnswers: [], // Options will be loaded when editing individual questions
          questionType: q.questionType || (q.type || "multiple_choice"),
          isMandatory: q.isMandatory !== undefined ? q.isMandatory : (q.mandatory || false),
          marks: q.marks || null,
        }));
        setQuestionBank(formattedQuestions);
      } else if (
        assessment.questionBank &&
        assessment.questionBank.length > 0
      ) {
        setQuestionBank(assessment.questionBank);
      } else {
        setQuestionBank([]);
      }
    } else {
      setName("");
      setDescription("");
      setQuestionsToPresent(0);
      setShowAnswers(true);
      setMaxRetries(3);
      setTimingMode("none");
      setTimeLimit(30);
      setPassMark(70);
      setIsAim(false);
      setQuestionBank([]);
    }
  }, [assessment, existingQuestions]);

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves

    setIsSaving(true);
    setError(""); // Clear any previous errors

    try {
      // Prepare assessment data
      const assessmentData = {
        name,
        description,
        questionsToPresent: Number(questionsToPresent),
        questionCount: questionBank.length,
        showAnswers,
        maxRetries: Number(maxRetries),
        timingMode,
        timeLimit: Number(timeLimit),
        passMark: Number(passMark),
        isAim: Boolean(isAim),
        course: courseId ? { id: courseId } : null, // null for standalone assessments
      };

      let savedAssessment;

      // Save or update assessment
      if (assessment?.id) {
        // Edit existing assessment - only update assessment data, not questions
        console.log("Updating assessment with data:", assessmentData);
        console.log("Pass mark being saved:", assessmentData.passMark);
        console.log("Is AIM being saved:", assessmentData.isAim);
        const result = await updateAssessment({
          id: assessment.id,
          updates: assessmentData,
        }).unwrap();
        console.log("Assessment update response:", result);
        console.log("Pass mark in response:", result.passMark);
        console.log("Is AIM in response:", result.isAim);
        
        // Warn if passmark is not in the response (backend issue)
        if (result.passMark === undefined || result.passMark === null) {
          console.warn("⚠️ WARNING: Pass mark was sent but not returned in response. Backend may not be saving/returning passMark field.");
          console.warn("Sent passMark:", assessmentData.passMark);
          console.warn("Response keys:", Object.keys(result));
          // Still include the passMark we sent in the saved assessment
          savedAssessment = { ...assessment, ...result, passMark: assessmentData.passMark };
        } else {
          savedAssessment = { ...assessment, ...result };
        }
      } else {
        // Create new assessment
        console.log("Creating assessment with data:", assessmentData);
        console.log("Pass mark being saved:", assessmentData.passMark);
        console.log("Is AIM being saved:", assessmentData.isAim);
        const result = await createAssessment(assessmentData).unwrap();
        console.log("Assessment create response:", result);
        console.log("Pass mark in response:", result.passMark);
        console.log("Is AIM in response:", result.isAim);
        
        // Warn if passmark is not in the response (backend issue)
        if (result.passMark === undefined || result.passMark === null) {
          console.warn("⚠️ WARNING: Pass mark was sent but not returned in response. Backend may not be saving/returning passMark field.");
          console.warn("Sent passMark:", assessmentData.passMark);
          console.warn("Response keys:", Object.keys(result));
          // Still include the passMark we sent in the saved assessment
          savedAssessment = { ...result, passMark: assessmentData.passMark };
        } else {
          savedAssessment = result;
        }

        // Only create questions for new assessments
        await Promise.all(
          questionBank.map(async (question) => {
            // Create the question first
            const savedQuestion = await createQuestion({
              text: question.text,
              optionsToPresent: question.optionsToPresent || 4,
              imageDataUrl: question.imageDataUrl || "",
              assessment: { id: savedAssessment.id },
            }).unwrap();

            // Create options for this question
            const options = question.optionalAnswers.map((optionText) => ({
              optionText,
              questionId: savedQuestion.id,
            }));

            const savedOptions = await createBulkOptions({
              questionId: savedQuestion.id,
              options,
            }).unwrap();

            // Find the correct option and set isCorrect flag
            const correctOption = savedOptions.find(
              (option) => option.optionText === question.correctAnswer
            );
            if (correctOption) {
              // Set the correct option using is_correct field
              try {
                await fetch(
                  `${
                    process.env.REACT_APP_API_URL || "http://localhost:8091"
                  }/question-options/${correctOption.id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isCorrect: true }),
                  }
                );
              } catch (error) {
                console.error("Error setting correct option:", error);
              }
            }
          })
        );
      }

      // Verify passmark was saved
      if (savedAssessment.passMark === undefined || savedAssessment.passMark === null) {
        console.warn("⚠️ Pass mark may not have been saved. Check backend implementation.");
        // Show warning to user
        setError("Assessment saved, but pass mark may not have been stored. Please verify in the database or contact support.");
      }
      
      // Call the parent onSave callback with the saved assessment
      onSave(savedAssessment);
    } catch (error) {
      console.error("Error saving assessment:", error);
      console.error("Error details:", {
        message: error?.data?.message || error?.message,
        status: error?.status,
        data: error?.data
      });
      // Show error in UI instead of alert
      const errorMessage = error?.data?.message 
        || error?.message 
        || "Error saving assessment. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = async (question) => {
    // If editing an existing question from API, load its options
    if (question.id && typeof question.id === "number") {
      try {
        // Load options for this question
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8091"
          }/question-options/question/${question.id}`
        );

        if (response.ok) {
          const options = await response.json();

          if (options.length > 0) {
            const questionWithOptions = {
              ...question,
              optionalAnswers: options.map((opt) => opt.optionText),
              correctAnswer:
                options.find((opt) => opt.isCorrect === true)?.optionText || "",
            };
            setEditingQuestion(questionWithOptions);
          } else {
            // If no options exist, create a question with empty options for editing
            const questionWithEmptyOptions = {
              ...question,
              optionalAnswers: ["", ""],
              correctAnswer: "",
            };
            setEditingQuestion(questionWithEmptyOptions);
          }
        } else {
          setEditingQuestion(question);
        }
      } catch (error) {
        console.error("Error loading question options:", error);
        setEditingQuestion(question);
      }
    } else {
      setEditingQuestion(question);
    }
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (id) => {
    setQuestionBank(questionBank.filter((q) => q.id !== id));
  };

  const handleSaveQuestion = (newQuestion) => {
    if (newQuestion.id) {
      setQuestionBank(
        questionBank.map((q) => (q.id === newQuestion.id ? newQuestion : q))
      );
    } else {
      setQuestionBank([
        ...questionBank,
        { ...newQuestion, id: `q${questionBank.length + 1}` },
      ]);
    }
    setShowQuestionForm(false);
  };

  const handleCancelQuestionForm = () => {
    setShowQuestionForm(false);
  };

  const cardClass = "bg-white rounded-lg shadow p-6";
  const cardHeaderClass = "mb-4";
  const cardTitleClass = "text-2xl font-bold text-gray-800";
  const cardDescriptionClass = "text-gray-600 mt-1";
  const formGroupClass = "grid gap-2";
  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const textareaClass = `${inputClass} min-h-[80px]`;
  const buttonGroupClass = "flex justify-end gap-2 mt-6";
  const primaryButtonClass =
    "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200";
  const ghostButtonClass =
    "px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200";
  const tableClass = "min-w-full divide-y divide-gray-200";
  const tableHeaderClass = "bg-gray-900";
  const tableHeadClass =
    "px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider";
  const tableCellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
  const actionButtonClass =
    "p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const smallButtonClass =
    "px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center";

  if (showQuestionForm) {
    return (
      <QuestionForm
        question={editingQuestion}
        onSave={handleSaveQuestion}
        onCancel={handleCancelQuestionForm}
        assessmentId={assessment?.id}
        assessmentTimingMode={timingMode}
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          {assessment ? "Edit Assessment" : "Create New Assessment"}
        </h2>
        <p className={cardDescriptionClass}>
          Manage the details and question bank for this assessment.
        </p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="grid gap-6">
        <div className={formGroupClass}>
          <span htmlFor="assessment-name" className={labelClass}>
            Assessment Name
          </span>
          <input
            id="assessment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fire Safety Basics"
            className={inputClass}
          />
        </div>
        <div className={formGroupClass}>
          <span htmlFor="assessment-description" className={labelClass}>
            Description
          </span>
          <textarea
            id="assessment-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the assessment"
            className={textareaClass}
          />
        </div>

        {/* Assessment Settings - 2 columns for wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className={formGroupClass}>
              <span htmlFor="questions-to-present" className={labelClass}>
                Number of Objective Questions to Present to User
              </span>
              <input
                id="questions-to-present"
                type="number"
                value={questionsToPresent}
                onChange={(e) =>
                  setQuestionsToPresent(
                    Math.max(
                      0,
                      Math.min(questionBank.length, Number(e.target.value))
                    )
                  )
                }
                placeholder="e.g., 15"
                min="0"
                max={questionBank.length}
                className={inputClass}
              />
              <p className="text-sm text-gray-500">
                Enter how many objective (multiple choice) questions will be randomly selected from the bank
                for each user attempt. Mandatory structured questions are always included separately. Max: {questionBank.length}
              </p>
            </div>

            {/* Display count of mandatory structured questions */}
            {(() => {
              const mandatoryStructuredCount = existingQuestions.filter(
                (q) => q.questionType === "structured" && q.isMandatory === true
              ).length;
              
              if (mandatoryStructuredCount > 0) {
                return (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Mandatory Structured Questions:</strong> {mandatoryStructuredCount}
                      {mandatoryStructuredCount === 1 ? " question" : " questions"} will always be included in this assessment.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className={formGroupClass}>
              <span htmlFor="max-retries" className={labelClass}>
                Maximum Quiz Retries
              </span>
              <input
                id="max-retries"
                type="number"
                value={maxRetries}
                onChange={(e) =>
                  setMaxRetries(Math.max(1, Number(e.target.value)))
                }
                placeholder="e.g., 3"
                min="1"
                max="10"
                className={inputClass}
              />
              <p className="text-sm text-gray-500">
                Number of times a user can retake this quiz. Set to 1 for no
                retries allowed.
              </p>
            </div>

            <div className={formGroupClass}>
              <span htmlFor="pass-mark" className={labelClass}>
                Pass Mark (%)
              </span>
              <input
                id="pass-mark"
                type="number"
                value={passMark}
                onChange={(e) =>
                  setPassMark(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                placeholder="e.g., 70"
                min="0"
                max="100"
                step="0.1"
                className={inputClass}
              />
              <p className="text-sm text-gray-500">
                Minimum percentage score required to pass this assessment. Default: 70%
              </p>
            </div>

            <div className={formGroupClass}>
              <div className="flex items-center justify-between">
                <div>
                  <span htmlFor="is-aim" className={labelClass}>
                    AIM Course
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Enable MANSOPS report generation for this assessment. Only AIM (Aviation Information Management) courses should have this enabled.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="is-aim"
                    type="checkbox"
                    checked={isAim}
                    onChange={(e) => setIsAim(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className={formGroupClass}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={labelClass}>Show Answers After Quiz</span>
                  <p className="text-sm text-gray-500 mt-1">
                    When enabled, users will see correct answers and
                    explanations after completing the quiz
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAnswers}
                    onChange={(e) => setShowAnswers(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className={formGroupClass}>
              <span className={labelClass}>Quiz Timing</span>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="timingMode"
                      value="none"
                      checked={timingMode === "none"}
                      onChange={(e) => setTimingMode(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">No Time Limit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="timingMode"
                      value="quiz"
                      checked={timingMode === "quiz"}
                      onChange={(e) => setTimingMode(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Time for Entire Quiz</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="timingMode"
                      value="question"
                      checked={timingMode === "question"}
                      onChange={(e) => setTimingMode(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Time per Question</span>
                  </label>
                </div>

                {timingMode !== "none" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {timingMode === "quiz"
                        ? "Time Limit (minutes):"
                        : "Time per Question (seconds):"}
                    </span>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) =>
                        setTimeLimit(Math.max(1, Number(e.target.value)))
                      }
                      min="1"
                      max={timingMode === "quiz" ? "180" : "300"}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-xs text-gray-500">
                      {timingMode === "quiz" ? "Max: 180 min" : "Max: 300 sec"}
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  {timingMode === "none" && "Quiz has no time restrictions."}
                  {timingMode === "quiz" &&
                    `Quiz will auto-submit after ${timeLimit} minute(s).`}
                  {timingMode === "question" &&
                    `Each question will auto-advance after ${timeLimit} second(s).`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Bank Section */}
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Question Bank ({questionBank.length} {questionBank.length === 1 ? "question" : "questions"})
            </h3>
            <div className="flex items-center space-x-4">
              {assessment?.id && (
                <button
                  type="button"
                  onClick={() => refetchQuestions()}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Refresh Questions
                </button>
              )}
              <button
                type="button"
                className={smallButtonClass}
                onClick={handleAddQuestion}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          {questionBank.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[38px]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter by Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[38px]"
                  >
                    <option value="all">All Types</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="structured">Structured</option>
                  </select>
                </div>

                {/* Filter by Mandatory */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mandatory Status
                  </label>
                  <select
                    value={filterMandatory}
                    onChange={(e) => setFilterMandatory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[38px]"
                  >
                    <option value="all">All</option>
                    <option value="mandatory">Mandatory</option>
                    <option value="non-mandatory">Non-Mandatory</option>
                  </select>
                </div>

                {/* Filter by Has Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Has Image
                  </label>
                  <select
                    value={filterHasImage}
                    onChange={(e) => setFilterHasImage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[38px]"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || filterType !== "all" || filterMandatory !== "all" || filterHasImage !== "all") && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                      setFilterMandatory("all");
                      setFilterHasImage("all");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Filtered Questions Table */}
          {(() => {
            // Filter questions based on search and filters
            const filteredQuestions = questionBank.filter((q) => {
              // Search filter
              if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const questionText = (q.text || "").toLowerCase();
                const correctAnswer = (questionOptions[q.id]?.correctAnswer || q.correctAnswer || "").toLowerCase();
                if (!questionText.includes(searchLower) && !correctAnswer.includes(searchLower)) {
                  return false;
                }
              }

              // Type filter
              if (filterType !== "all") {
                const questionType = q.questionType || (q.type || "multiple_choice");
                // Normalize question type: "MCQ" -> "multiple_choice"
                const normalizedType = questionType === "MCQ" ? "multiple_choice" : questionType;
                if (filterType === "multiple_choice" && normalizedType !== "multiple_choice") {
                  return false;
                }
                if (filterType === "structured" && normalizedType !== "structured") {
                  return false;
                }
              }

              // Mandatory filter
              if (filterMandatory !== "all") {
                const isMandatory = q.isMandatory !== undefined ? q.isMandatory : (q.mandatory || false);
                if (filterMandatory === "mandatory" && !isMandatory) {
                  return false;
                }
                if (filterMandatory === "non-mandatory" && isMandatory) {
                  return false;
                }
              }

              // Has Image filter
              if (filterHasImage !== "all") {
                const hasImage = q.imageDataUrl && q.imageDataUrl.trim() !== "";
                if (filterHasImage === "yes" && !hasImage) {
                  return false;
                }
                if (filterHasImage === "no" && hasImage) {
                  return false;
                }
              }

              return true;
            });

            return filteredQuestions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead className={tableHeaderClass}>
                    <tr>
                      <th scope="col" className={tableHeadClass}>
                        Question
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Type
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Mandatory
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Marks
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Has Image
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Options
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Options Presented
                      </th>
                      <th scope="col" className={tableHeadClass}>
                        Correct Answer
                      </th>
                      <th scope="col" className={`${tableHeadClass} text-right`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuestions.map((q) => {
                      const rawQuestionType = q.questionType || (q.type || "multiple_choice");
                      // Normalize question type: "MCQ" -> "multiple_choice"
                      const questionType = rawQuestionType === "MCQ" ? "multiple_choice" : rawQuestionType;
                      const isMandatory = q.isMandatory !== undefined ? q.isMandatory : (q.mandatory || false);
                      const hasImage = q.imageDataUrl && q.imageDataUrl.trim() !== "";
                      const optionsData = questionOptions[q.id] || { options: [], correctAnswer: "", optionCount: 0 };
                      const correctAnswer = optionsData.correctAnswer || q.correctAnswer || "";
                      const optionCount = optionsData.optionCount || (optionsData.options?.length || 0);
                      const optionsToPresent = q.optionsToPresent || 0;
                      const marks = q.marks || null;

                      // Strip HTML tags for display
                      const questionText = q.text || "";
                      const displayText = questionText.replace(/<[^>]*>/g, "").trim();

                      return (
                        <tr key={q.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                          <td className={`${tableCellClass} font-medium max-w-xs`}>
                            <div className="truncate" title={displayText}>
                              {displayText.substring(0, 60)}
                              {displayText.length > 60 ? "..." : ""}
                            </div>
                          </td>
                          <td className={tableCellClass}>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                questionType === "structured"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {questionType === "structured" ? "Structured" : "Multiple Choice"}
                            </span>
                          </td>
                          <td className={tableCellClass}>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isMandatory
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {isMandatory ? "Mandatory" : "Non-Mandatory"}
                            </span>
                          </td>
                          <td className={tableCellClass}>
                            {marks !== null && marks !== undefined ? marks.toFixed(1) : "—"}
                          </td>
                          <td className={tableCellClass}>
                            {hasImage ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className={tableCellClass}>
                            {questionType === "structured" ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              optionCount
                            )}
                          </td>
                          <td className={tableCellClass}>
                            {questionType === "structured" ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              optionsToPresent
                            )}
                          </td>
                          <td className={`${tableCellClass} max-w-xs`}>
                            {correctAnswer ? (
                              <div className="truncate" title={correctAnswer}>
                                {correctAnswer.substring(0, 40)}
                                {correctAnswer.length > 40 ? "..." : ""}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className={`${tableCellClass} text-right`}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                className={actionButtonClass}
                                onClick={() => handleEditQuestion(q)}
                              >
                                <Edit className="h-4 w-4 text-gray-700" />
                                <span className="sr-only">Edit Question</span>
                              </button>
                              <button
                                type="button"
                                className={actionButtonClass}
                                onClick={() => handleDeleteQuestion(q.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                                <span className="sr-only">Delete Question</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredQuestions.length < questionBank.length && (
                  <div className="mt-2 text-sm text-gray-500 text-center">
                    Showing {filteredQuestions.length} of {questionBank.length} questions
                  </div>
                )}
              </div>
            ) : questionBank.length > 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions match your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setFilterMandatory("all");
                    setFilterHasImage("all");
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <p className="text-gray-500">
                No questions in the bank yet. Add some!
              </p>
            );
          })()}
        </div>

        <div className={buttonGroupClass}>
          <button
            type="button"
            className={ghostButtonClass}
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${primaryButtonClass} ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
AssessmentForm.propTypes = {
  assessment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    questionsToPresent: PropTypes.number,
    showAnswers: PropTypes.bool,
    maxRetries: PropTypes.number,
    timingMode: PropTypes.oneOf(["none", "quiz", "question"]),
    timeLimit: PropTypes.number,
    passMark: PropTypes.number,
    questionBank: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        correctAnswer: PropTypes.string.isRequired,
      })
    ),
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
