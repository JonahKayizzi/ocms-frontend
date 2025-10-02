/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Plus, X } from 'lucide-react';

export default function QuestionForm({ question, onSave, onCancel }) {
  const [text, setText] = useState(question?.text || '');
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || '');
  const [optionalAnswers, setOptionalAnswers] = useState(question?.optionalAnswers || ['', '']);
  const [optionsToPresent, setOptionsToPresent] = useState(
    question?.optionsToPresent || Math.max(2, Math.min(4, (question?.optionalAnswers || []).filter((o) => o && o.trim() !== '').length || 2)),
  );
  const [imageDataUrl, setImageDataUrl] = useState(question?.imageDataUrl || '');

  useEffect(() => {
    if (question) {
      setText(question.text);
      setCorrectAnswer(question.correctAnswer || '');
      setOptionalAnswers(
        (question.optionalAnswers && question.optionalAnswers.length > 0)
          ? question.optionalAnswers
          : ['', ''],
      );
      setOptionsToPresent(question.optionsToPresent || Math.max(2, Math.min(4, (question.optionalAnswers || []).filter((o) => o && o.trim() !== '').length || 2)));
      setImageDataUrl(question.imageDataUrl || '');
    } else {
      setText('');
      setCorrectAnswer('');
      setOptionalAnswers(['', '']);
      setOptionsToPresent(2);
      setImageDataUrl('');
    }
  }, [question]);

  // Ensure correctAnswer stays within available options
  useEffect(() => {
    const nonEmptyOptions = optionalAnswers.filter((o) => o && o.trim() !== '');

    // Enforce at least 2 TOTAL option fields (not non-empty) to avoid infinite adds
    if (optionalAnswers.length < 2) {
      setOptionalAnswers((prev) => (
        prev.length < 2
          ? [...prev, ...Array.from({ length: 2 - prev.length }).map(() => '')]
          : prev
      ));
      return; // Exit to avoid running the rest in the same tick
    }

    // Keep correct answer in-sync with available non-empty options
    if (!nonEmptyOptions.includes(correctAnswer)) {
      const nextCorrect = nonEmptyOptions[0] || '';
      if (nextCorrect !== correctAnswer) setCorrectAnswer(nextCorrect);
    }

    // Clamp optionsToPresent without causing loops
    setOptionsToPresent((prev) => {
      const minAllowed = 2;
      const maxAllowed = nonEmptyOptions.length || 2;
      const target = Math.max(minAllowed, Math.min(maxAllowed, prev || 2));
      return target === prev ? prev : target;
    });
  }, [optionalAnswers, correctAnswer]);

  const handleAddOption = () => {
    setOptionalAnswers([...optionalAnswers, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...optionalAnswers];
    newOptions[index] = value;
    setOptionalAnswers(newOptions);
  };

  const handleRemoveOption = (index) => {
    const newOptions = optionalAnswers.filter((_, i) => i !== index);
    setOptionalAnswers(newOptions);
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => setImageDataUrl('');

  const handleSave = () => {
    const filteredOptionalAnswers = optionalAnswers.filter((option) => option.trim() !== '');
    if (filteredOptionalAnswers.length < 2) {
      return; // Basic guard; optionally show validation messaging
    }
    const validCorrect = filteredOptionalAnswers.includes(correctAnswer)
      ? correctAnswer
      : filteredOptionalAnswers[0];
    const clampedOptionsToPresent = Math.max(
      2,
      Math.min(
        filteredOptionalAnswers.length,
        Number(optionsToPresent) || 2,
      ),
    );
    onSave({
      id: question?.id,
      text,
      correctAnswer: validCorrect,
      optionalAnswers: filteredOptionalAnswers,
      optionsToPresent: clampedOptionsToPresent,
      imageDataUrl,
    });
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
  const outlineButtonClass = 'px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const removeButtonClass = 'p-2 rounded-md hover:bg-red-100 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500';

  const nonEmptyOptions = optionalAnswers.filter((o) => o && o.trim() !== '');

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>{question ? 'Edit Question' : 'Create New Question'}</h2>
        <p className={cardDescriptionClass}>
          Define the question, its correct answer, a bank of optional answers, and an
          optional image.
        </p>
      </div>
      <div className="grid gap-6">
        <div className={formGroupClass}>
          <span htmlFor="question-text" className={labelClass}>Question</span>
          <textarea
            id="question-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the question here..."
            className={textareaClass}
          />
        </div>

        <div className={formGroupClass}>
          <span className={labelClass}>Question Image (optional)</span>
          {imageDataUrl && (
            <div className="mb-2">
              <img src={imageDataUrl} alt="Question" className="max-h-40 rounded" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handleImageChange} className={inputClass} />
            {imageDataUrl && (
              <button type="button" className={removeButtonClass} onClick={handleClearImage}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </button>
            )}
          </div>
        </div>

        <div className={formGroupClass}>
          <span htmlFor="correct-answer" className={labelClass}>Correct Answer</span>
          <select
            id="correct-answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className={inputClass}
          >
            {nonEmptyOptions.length === 0 && <option value="" disabled>No options available</option>}
            {nonEmptyOptions.map((opt, idx) => (
              <option key={idx} value={opt}>{opt || `Option ${idx + 1}`}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4">
          <span className={labelClass}>Optional Answers</span>
          <p className="text-sm text-gray-500">
            Provide answer options. At least 2 required.
          </p>
          {optionalAnswers.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Optional Answer ${index + 1}`}
                className={inputClass}
              />
              {optionalAnswers.length > 2 && (
                <button type="button" className={removeButtonClass} onClick={() => handleRemoveOption(index)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove option</span>
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button type="button" className={outlineButtonClass} onClick={handleAddOption}>
              <Plus className="mr-2 h-4 w-4" />
              Add Another Option
            </button>
          </div>
        </div>

        <div className={formGroupClass}>
          <span htmlFor="options-to-present" className={labelClass}>Number of Options to Display to User</span>
          <input
            id="options-to-present"
            type="number"
            value={optionsToPresent}
            onChange={(e) => setOptionsToPresent(
              Math.max(2, Math.min(nonEmptyOptions.length || 2, Number(e.target.value) || 2)),
            )}
            placeholder="e.g., 4"
            min="2"
            max={nonEmptyOptions.length || 2}
            className={inputClass}
          />
          <p className="text-sm text-gray-500">
            Must be between 2 and the number of non-empty options (
            {nonEmptyOptions.length || 2}
            ).
          </p>
        </div>

        <div className={buttonGroupClass}>
          <button type="button" className={ghostButtonClass} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClass} onClick={handleSave}>
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
}
QuestionForm.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    correctAnswer: PropTypes.string,
    optionalAnswers: PropTypes.arrayOf(PropTypes.string),
    optionsToPresent: PropTypes.number,
    imageDataUrl: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

QuestionForm.defaultProps = {
  question: null,
};
