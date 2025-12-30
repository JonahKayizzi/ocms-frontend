import PropTypes from "prop-types";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function QuestionResult({
  question,
  questionNumber,
  userAnswer,
}) {
  // Detect if this is a structured question
  const isStructured =
    question.questionType === "structured" ||
    !question.options ||
    question.options.length === 0;

  const isCorrect = userAnswer?.isCorrect || false;

  // Get structured answer if available
  const structuredAnswer =
    userAnswer?.structuredAnswer ||
    (typeof userAnswer?.selectedAnswer === "string"
      ? userAnswer.selectedAnswer
      : null);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        {/* Render question text as HTML for structured questions */}
        {isStructured ? (
          <h4 className="font-medium text-gray-900 flex-1">
            {questionNumber}.
            <div
              className="inline prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
              dangerouslySetInnerHTML={{ __html: question.question }}
            />
          </h4>
        ) : (
          <h4 className="font-medium text-gray-900 flex-1">
            {questionNumber}.{question.question}
          </h4>
        )}

        {/* Show appropriate badge based on question type */}
        {isStructured ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </span>
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
              isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isCorrect ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
        )}
      </div>

      {/* Display content based on question type */}
      {isStructured ? (
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700 text-sm block mb-2">
              Your Answer:
            </span>
            {structuredAnswer &&
            structuredAnswer.trim() !== "" &&
            structuredAnswer !== "<p><br></p>" ? (
              <div
                className="text-sm text-gray-700 bg-blue-50 p-4 rounded-md border border-blue-200 prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
                dangerouslySetInnerHTML={{ __html: structuredAnswer }}
              />
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200 italic">
                No answer provided
              </div>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This question requires review. Your answer
              will be graded by the examiner.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {question.options.map((option, optionIndex) => {
            const isUserAnswer = userAnswer?.selectedAnswer === optionIndex;
            const isCorrectAnswer = optionIndex === question.correctAnswer;

            let className = "p-2 rounded border text-sm ";
            if (isCorrectAnswer) {
              className += "bg-green-50 border-green-200 text-green-800";
            } else if (isUserAnswer && !isCorrectAnswer) {
              className += "bg-red-50 border-red-200 text-red-800";
            } else {
              className += "bg-gray-50 border-gray-200";
            }

            return (
              <div
                key={`question-${question.id}-result-option-${optionIndex}`} /* eslint-disable-line react/no-array-index-key */
                className={className}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <div className="flex gap-1">
                    {isCorrectAnswer && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-200">
                        Correct
                      </span>
                    )}
                    {isUserAnswer && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                        Your Answer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

QuestionResult.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    questionType: PropTypes.string, // 'multiple_choice' or 'structured'
    options: PropTypes.arrayOf(PropTypes.string),
    correctAnswer: PropTypes.number,
    structuredTimeLimit: PropTypes.number,
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  userAnswer: PropTypes.shape({
    questionId: PropTypes.number.isRequired,
    selectedAnswer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    structuredAnswer: PropTypes.string,
    isCorrect: PropTypes.bool,
  }),
};

QuestionResult.defaultProps = {
  userAnswer: null,
};
