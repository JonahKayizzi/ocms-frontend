"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AnswerOption from "./AnswerOptions";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  isLastQuestion,
  showPrevious,
  questionType, // 'multiple_choice' or 'structured'
}) {
  // Fallback: detect structured question if no options available
  const detectedQuestionType =
    questionType ||
    (question.options && question.options.length > 0
      ? "multiple_choice"
      : "structured");
  const isStructured = detectedQuestionType === "structured";

  const [structuredAnswer, setStructuredAnswer] = useState(
    isStructured && typeof selectedAnswer === "string" ? selectedAnswer : ""
  );

  // Sync structured answer with selectedAnswer prop
  useEffect(() => {
    if (isStructured) {
      if (typeof selectedAnswer === "string") {
        setStructuredAnswer(selectedAnswer);
      } else {
        setStructuredAnswer("");
      }
    } else {
      // Reset structured answer when switching to multiple choice
      setStructuredAnswer("");
    }
  }, [selectedAnswer, isStructured]);

  const handleStructuredAnswerChange = (value) => {
    setStructuredAnswer(value);
    // Call onAnswerSelect with the text value for structured questions
    if (onAnswerSelect) {
      onAnswerSelect(value);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="text-xl font-semibold text-gray-900 mb-2">
          {/* Render question as HTML since it comes from rich text editor */}
          <div
            dangerouslySetInnerHTML={{ __html: question.question || "" }}
            className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
          />
        </div>
        <p className="text-gray-600 mt-2">
          {isStructured
            ? "Provide your answer in the text area below and click Next to continue"
            : "Select the correct answer and click Next to continue"}
        </p>
      </div>
      <div className="p-6">
        {/* Display image if available */}
        {question.imageDataUrl && question.imageDataUrl.trim() !== "" && (
          <div className="mb-6 flex justify-center">
            <img
              src={question.imageDataUrl}
              alt="Question illustration"
              className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
              onError={(e) => {
                console.error("Failed to load image:", question.imageDataUrl);
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
        {isStructured ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                <style>{`
                  .ql-container {
                    min-height: 250px;
                    font-size: 16px;
                  }
                  .ql-editor {
                    min-height: 250px;
                  }
                  .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #9ca3af;
                  }
                `}</style>
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  value={structuredAnswer}
                  onChange={handleStructuredAnswerChange}
                  placeholder="Type your answer here. You can format your text using the toolbar above..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use the formatting toolbar to format your answer. Your answer
                will be saved as you type.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <AnswerOption
                key={`question-${question.id}-option-${index}`} /* eslint-disable-line react/no-array-index-key */
                option={option}
                index={index}
                questionId={question.id}
                isSelected={selectedAnswer === index}
                onSelect={onAnswerSelect}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isStructured
              ? structuredAnswer &&
                structuredAnswer.trim() !== "" &&
                structuredAnswer !== "<p><br></p>"
                ? "Answer provided"
                : "Please provide your answer"
              : selectedAnswer !== null
              ? "Answer selected"
              : "Please select an answer"}
          </div>
          <div className="flex items-center gap-3">
            {showPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                className="px-4 py-2 font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              disabled={
                isStructured
                  ? !structuredAnswer ||
                    structuredAnswer.trim() === "" ||
                    structuredAnswer === "<p><br></p>"
                  : selectedAnswer === null
              }
              className={`px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                (
                  isStructured
                    ? structuredAnswer &&
                      structuredAnswer.trim() !== "" &&
                      structuredAnswer !== "<p><br></p>"
                    : selectedAnswer !== null
                )
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLastQuestion ? "Submit Quiz" : "Next Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    correctAnswer: PropTypes.number,
    imageDataUrl: PropTypes.string,
  }).isRequired,
  selectedAnswer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onAnswerSelect: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func,
  isLastQuestion: PropTypes.bool.isRequired,
  showPrevious: PropTypes.bool,
  questionType: PropTypes.string,
};

QuestionCard.defaultProps = {
  selectedAnswer: null,
  onPrevious: undefined,
  showPrevious: false,
  questionType: "multiple_choice",
};
