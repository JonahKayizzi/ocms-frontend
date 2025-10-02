import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import QuestionForm from './question-form';
import {
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useCreateQuestionMutation,
} from '../../../../../redux/apiSlice';

export default function AssessmentForm({
  assessment,
  onSave,
  onCancel,
  courseId,
}) {
  const [name, setName] = useState(assessment?.name || '');
  const [description, setDescription] = useState(assessment?.description || '');
  const [questionsToPresent, setQuestionsToPresent] = useState(
    assessment?.questionsToPresent || 0,
  );
  const [questionBank, setQuestionBank] = useState(
    assessment?.questionBank || [],
  );
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // RTK Query mutations
  const [createAssessment] = useCreateAssessmentMutation();
  const [updateAssessment] = useUpdateAssessmentMutation();
  const [createQuestion] = useCreateQuestionMutation();

  useEffect(() => {
    if (assessment) {
      setName(assessment.name);
      setDescription(assessment.description);
      setQuestionsToPresent(assessment.questionsToPresent);
      setQuestionBank(assessment.questionBank || []);
    } else {
      setName('');
      setDescription('');
      setQuestionsToPresent(0);
      setQuestionBank([]);
    }
  }, [assessment]);

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves

    setIsSaving(true);

    try {
      // Prepare assessment data
      const assessmentData = {
        name,
        description,
        questionsToPresent: Number(questionsToPresent),
        questionCount: questionBank.length,
        courseId: courseId || null, // null for standalone assessments
      };

      let savedAssessment;

      // Save or update assessment
      if (assessment?.id) {
        // Edit existing assessment
        const result = await updateAssessment({
          assessmentId: assessment.id,
          updates: assessmentData,
        }).unwrap();
        savedAssessment = { ...assessment, ...result };
      } else {
        // Create new assessment
        const result = await createAssessment(assessmentData).unwrap();
        savedAssessment = result;
      }

      // Save each question separately (batch)
      await Promise.all(
        questionBank.map((question) => createQuestion({
          text: question.text,
          correctAnswer: question.correctAnswer,
          optionsToPresent: question.optionsToPresent || 4,
          imageDataUrl: question.imageDataUrl || '',
          assessment: { id: savedAssessment.id },
        }).unwrap()),
      );

      // Call the parent onSave callback with the saved assessment
      onSave(savedAssessment);
    } catch (error) {
      console.error('Error saving assessment:', error);
      // You might want to show an error message to the user here
      alert('Error saving assessment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (id) => {
    setQuestionBank(questionBank.filter((q) => q.id !== id));
  };

  const handleSaveQuestion = (newQuestion) => {
    if (newQuestion.id) {
      setQuestionBank(
        questionBank.map((q) => (q.id === newQuestion.id ? newQuestion : q)),
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

  const cardClass = 'bg-white rounded-lg shadow p-6';
  const cardHeaderClass = 'mb-4';
  const cardTitleClass = 'text-2xl font-bold text-gray-800';
  const cardDescriptionClass = 'text-gray-600 mt-1';
  const formGroupClass = 'grid gap-2';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const textareaClass = `${inputClass} min-h-[80px]`;
  const buttonGroupClass = 'flex justify-end gap-2 mt-6';
  const primaryButtonClass = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200';
  const ghostButtonClass = 'px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200';
  const tableClass = 'min-w-full divide-y divide-gray-200';
  const tableHeaderClass = 'bg-gray-900';
  const tableHeadClass = 'px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider';
  const tableCellClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  const actionButtonClass = 'p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const smallButtonClass = 'px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center';

  if (showQuestionForm) {
    return (
      <QuestionForm
        question={editingQuestion}
        onSave={handleSaveQuestion}
        onCancel={handleCancelQuestionForm}
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          {assessment ? 'Edit Assessment' : 'Create New Assessment'}
        </h2>
        <p className={cardDescriptionClass}>
          Manage the details and question bank for this assessment.
        </p>
      </div>
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

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Question Bank (
              {questionBank.length}
              {' '}
              questions)
            </h3>
            <button type="button" className={smallButtonClass} onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              {' '}
              Add Question
            </button>
          </div>
          {questionBank.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead className={tableHeaderClass}>
                  <tr>
                    <th scope="col" className={tableHeadClass}>
                      Question
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
                  {questionBank.map((q) => (
                    <tr key={q.id} className="odd:bg-white even:bg-gray-50">
                      <td className={`${tableCellClass} font-medium`}>
                        {q.text.substring(0, 50)}
                        ...
                      </td>
                      <td className={tableCellClass}>{q.correctAnswer}</td>
                      <td className={`${tableCellClass} text-right`}>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">
              No questions in the bank yet. Add some!
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <span htmlFor="questions-to-present" className={labelClass}>
            Number of Questions to Present to User
          </span>
          <input
            id="questions-to-present"
            type="number"
            value={questionsToPresent}
            onChange={(e) => setQuestionsToPresent(
              Math.max(
                0,
                Math.min(questionBank.length, Number(e.target.value)),
              ),
            )}
            placeholder="e.g., 15"
            min="0"
            max={questionBank.length}
            className={inputClass}
          />
          <p className="text-sm text-gray-500">
            Enter how many questions will be randomly selected from the bank for
            each user attempt. Max:
            {' '}
            {questionBank.length}
          </p>
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
            className={`${primaryButtonClass} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Assessment'}
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
    questionBank: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        correctAnswer: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
