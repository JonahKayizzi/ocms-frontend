/* eslint-disable react/no-array-index-key */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Plus, X } from "lucide-react";
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useCreateBulkOptionsMutation,
} from "../../../../../redux/apiSlice";

export default function QuestionForm({
  question,
  onSave,
  onCancel,
  assessmentId,
}) {
  const [text, setText] = useState(question?.text || "");
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [optionalAnswers, setOptionalAnswers] = useState(
    question?.optionalAnswers || ["", ""]
  );
  const [optionsToPresent, setOptionsToPresent] = useState(
    question?.optionsToPresent ||
      Math.max(
        2,
        Math.min(
          4,
          (question?.optionalAnswers || []).filter((o) => o && o.trim() !== "")
            .length || 2
        )
      )
  );
  const [imageDataUrl, setImageDataUrl] = useState(
    question?.imageDataUrl || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [modifiedOptions, setModifiedOptions] = useState(new Set());
  const [savingOptions, setSavingOptions] = useState(new Set());
  const [loadedOptions, setLoadedOptions] = useState([]);
  const [questionSaved, setQuestionSaved] = useState(false); // Track if question is saved

  // RTK Query mutations
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [createBulkOptions] = useCreateBulkOptionsMutation();

  useEffect(() => {
    if (question) {
      setText(question.text);
      // Find the correct option index from loaded options
      const correctOption = question.options?.find(
        (opt) => opt.isCorrect === true
      );
      if (correctOption) {
        const correctIndex =
          question.options?.findIndex((opt) => opt.id === correctOption.id) ||
          0;
        setCorrectOptionIndex(correctIndex);
      }
      setOptionalAnswers(
        question.optionalAnswers && question.optionalAnswers.length > 0
          ? question.optionalAnswers
          : ["", ""]
      );
      setOptionsToPresent(
        question.optionsToPresent ||
          Math.max(
            2,
            Math.min(
              4,
              (question.optionalAnswers || []).filter(
                (o) => o && o.trim() !== ""
              ).length || 2
            )
          )
      );
      setImageDataUrl(question.imageDataUrl || "");
      setQuestionSaved(true); // Existing question is already saved
    } else {
      setText("");
      setCorrectOptionIndex(0);
      setOptionalAnswers(["", ""]);
      setOptionsToPresent(2);
      setImageDataUrl("");
      setQuestionSaved(false); // New question not saved yet
    }
  }, [question]);

  // Load options when editing an existing question
  useEffect(() => {
    const loadOptions = async () => {
      if (question?.id && typeof question.id === "number") {
        try {
          const response = await fetch(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:8091"
            }/question-options/question/${question.id}`
          );
          if (response.ok) {
            const options = await response.json();
            setLoadedOptions(options);

            // Update optionalAnswers with loaded options
            if (options.length > 0) {
              const optionTexts = options.map((opt) => opt.optionText);
              // Ensure we have at least 2 options
              while (optionTexts.length < 2) {
                optionTexts.push("");
              }
              setOptionalAnswers(optionTexts);
            }
          }
        } catch (error) {
          console.error("Error loading options:", error);
        }
      } else {
        setLoadedOptions([]);
      }
    };

    loadOptions();
  }, [question?.id]);

  // Ensure correctAnswer stays within available options
  useEffect(() => {
    const currentNonEmptyOptions = optionalAnswers.filter(
      (o) => o && o.trim() !== ""
    );
    const loadedOptionTexts = loadedOptions.map((opt) => opt.optionText);
    const nonEmptyOptions = [
      ...new Set([...currentNonEmptyOptions, ...loadedOptionTexts]),
    ].filter((opt) => opt && opt.trim() !== "");

    // Enforce at least 2 TOTAL option fields (not non-empty) to avoid infinite adds
    if (optionalAnswers.length < 2) {
      setOptionalAnswers((prev) =>
        prev.length < 2
          ? [...prev, ...Array.from({ length: 2 - prev.length }).map(() => "")]
          : prev
      );
      return; // Exit to avoid running the rest in the same tick
    }

    // Keep correct option index in-sync with available options
    if (correctOptionIndex >= nonEmptyOptions.length) {
      setCorrectOptionIndex(0);
    }

    // Clamp optionsToPresent without causing loops
    setOptionsToPresent((prev) => {
      const minAllowed = 2;
      const maxAllowed = nonEmptyOptions.length || 2;
      const target = Math.max(minAllowed, Math.min(maxAllowed, prev || 2));
      return target === prev ? prev : target;
    });
  }, [optionalAnswers, correctOptionIndex, loadedOptions]);

  const handleAddOption = () => {
    setOptionalAnswers([...optionalAnswers, ""]);
  };

  const handleRemoveOption = async (index) => {
    const optionText = optionalAnswers[index];

    // If we're editing an existing question, try to find and delete the corresponding option from database
    if (question?.id && optionText && optionText.trim()) {
      const optionToDelete = loadedOptions.find(
        (opt) => opt.optionText === optionText.trim()
      );
      if (optionToDelete && optionToDelete.id) {
        try {
          // Delete from database
          await fetch(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:8091"
            }/question-options/${optionToDelete.id}`,
            {
              method: "DELETE",
            }
          );

          // Remove from loaded options
          setLoadedOptions((prev) =>
            prev.filter((opt) => opt.id !== optionToDelete.id)
          );
        } catch (error) {
          console.error("Error deleting option:", error);
          setError("Error deleting option. Please try again.");
          return;
        }
      }
    }

    // Remove from local state
    const newOptions = optionalAnswers.filter((_, i) => i !== index);
    setOptionalAnswers(newOptions);

    // Remove from modified options if it was modified
    setModifiedOptions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
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

  const handleClearImage = () => setImageDataUrl("");

  const handleOptionChange = (index, value) => {
    const newOptions = [...optionalAnswers];
    newOptions[index] = value;
    setOptionalAnswers(newOptions);

    // Mark this option as modified
    setModifiedOptions((prev) => new Set([...prev, index]));
  };

  const handleSaveOption = async (index) => {
    if (!question?.id || !optionalAnswers[index]?.trim()) return;

    setSavingOptions((prev) => new Set([...prev, index]));

    try {
      const options = [
        {
          optionText: optionalAnswers[index],
          questionId: question.id,
        },
      ];

      const savedOptions = await createBulkOptions({
        options,
      }).unwrap();

      // Update loaded options with the new saved option
      setLoadedOptions((prev) => {
        const newOptions = [...prev];
        // Add the new option if it doesn't exist
        if (savedOptions.length > 0) {
          const newOption = savedOptions[0];
          const existingIndex = newOptions.findIndex(
            (opt) => opt.id === newOption.id
          );
          if (existingIndex >= 0) {
            newOptions[existingIndex] = newOption;
          } else {
            newOptions.push(newOption);
          }
        }
        return newOptions;
      });

      // Mark as no longer modified
      setModifiedOptions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } catch (error) {
      console.error("Error saving option:", error);
      setError("Error saving option. Please try again.");
    } finally {
      setSavingOptions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleSaveQuestionOnly = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError("");

    try {
      if (!text.trim()) {
        setError("Question text is required");
        return;
      }

      const clampedOptionsToPresent = Math.max(
        2,
        Math.min(
          optionalAnswers.filter((o) => o.trim() !== "").length || 2,
          Number(optionsToPresent) || 2
        )
      );

      console.log("=== SAVING QUESTION ONLY ===");
      console.log("Question text:", text);
      console.log("Assessment ID:", assessmentId);
      console.log("Options to present:", clampedOptionsToPresent);

      let savedQuestion;

      if (question?.id) {
        console.log("Updating existing question with ID:", question.id);
        // Update existing question
        savedQuestion = await updateQuestion({
          id: question.id,
          updates: {
            text,
            optionsToPresent: clampedOptionsToPresent,
            imageDataUrl,
          },
        }).unwrap();

        console.log("Updated question:", savedQuestion);
      } else {
        console.log("Creating new question for assessment:", assessmentId);
        // Create new question
        savedQuestion = await createQuestion({
          text,
          optionsToPresent: clampedOptionsToPresent,
          imageDataUrl,
          assessment: { id: assessmentId },
        }).unwrap();

        console.log("Created question:", savedQuestion);
        setQuestionSaved(true); // Mark question as saved
      }

      // Call the parent onSave callback to refresh the question bank
      console.log("Calling onSave callback with saved question data");
      onSave({
        id: savedQuestion.id,
        text,
        correctOptionIndex: correctOptionIndex,
        optionalAnswers: optionalAnswers.filter((o) => o.trim() !== ""),
        optionsToPresent: clampedOptionsToPresent,
        imageDataUrl,
      });

      console.log("Question saved successfully!");
    } catch (error) {
      console.error("Error saving question:", error);
      setError("Error saving question. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOptions = async () => {
    if (!questionSaved && !question?.id) {
      setError("Please save the question first before adding options");
      return;
    }

    const questionId = question?.id;
    if (!questionId) {
      setError("Question ID not found. Please save the question first.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const filteredOptionalAnswers = optionalAnswers.filter(
        (option) => option.trim() !== ""
      );
      if (filteredOptionalAnswers.length < 2) {
        setError("At least 2 answer options are required");
        return;
      }

      const validCorrectOptionIndex = correctOptionIndex || 0;
      const clampedOptionsToPresent = Math.max(
        2,
        Math.min(filteredOptionalAnswers.length, Number(optionsToPresent) || 2)
      );

      console.log("=== SAVING QUESTION AND OPTIONS ===");
      console.log("Question ID:", questionId);
      console.log("Question text:", text);
      console.log("Image URL:", imageDataUrl);
      console.log("Options to present:", clampedOptionsToPresent);
      console.log("Options:", filteredOptionalAnswers);
      console.log("Correct option index:", validCorrectOptionIndex);

      // First, update the question properties
      try {
        const questionUpdateData = {
          text,
          optionsToPresent: clampedOptionsToPresent,
          imageDataUrl,
        };

        console.log("Updating question properties:", questionUpdateData);

        const questionResponse = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8091"
          }/assessment-questions/${questionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(questionUpdateData),
          }
        );

        if (questionResponse.ok) {
          console.log("Question properties updated successfully");
        } else {
          const errorText = await questionResponse.text();
          console.error("Failed to update question properties:", errorText);
        }
      } catch (error) {
        console.error("Error updating question properties:", error);
      }

      // Delete existing options first (for editing)
      if (question?.id && loadedOptions.length > 0) {
        try {
          for (const existingOption of loadedOptions) {
            await fetch(
              `${
                process.env.REACT_APP_API_URL || "http://localhost:8091"
              }/question-options/${existingOption.id}`,
              {
                method: "DELETE",
              }
            );
          }
        } catch (error) {
          console.error("Error deleting existing options:", error);
        }
      }

      // Create new options individually
      let savedOptions = [];
      try {
        for (const optionText of filteredOptionalAnswers) {
          console.log("Question ID being used:", questionId);

          const optionData = {
            optionText,
            questionId: questionId,
          };

          console.log("Creating individual option:", optionData);

          const response = await fetch(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:8091"
            }/question-options`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(optionData),
            }
          );

          if (response.ok) {
            const savedOption = await response.json();
            savedOptions.push(savedOption);
            console.log("Created option:", savedOption);
          } else {
            const errorText = await response.text();
            console.error("Failed to create option:", errorText);
          }
        }

        // Set the correct option using is_correct field
        if (
          savedOptions.length > 0 &&
          validCorrectOptionIndex < savedOptions.length
        ) {
          const correctOptionId = savedOptions[validCorrectOptionIndex].id;
          console.log(
            "Setting correct option:",
            correctOptionId,
            "for index:",
            validCorrectOptionIndex
          );
          try {
            await fetch(
              `${
                process.env.REACT_APP_API_URL || "http://localhost:8091"
              }/question-options/${correctOptionId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ isCorrect: true }),
              }
            );
            console.log("Successfully set correct option");
          } catch (error) {
            console.error("Error setting correct option:", error);
          }
        }
      } catch (error) {
        console.error("Error creating options:", error);
      }

      console.log("Question and options saved successfully!");

      // Call the parent onSave callback to refresh the question bank with updated data
      onSave({
        id: questionId,
        text,
        correctOptionIndex: validCorrectOptionIndex,
        optionalAnswers: filteredOptionalAnswers,
        optionsToPresent: clampedOptionsToPresent,
        imageDataUrl,
      });
    } catch (error) {
      console.error("Error saving question and options:", error);
      setError("Error saving question and options. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError("");

    try {
      const filteredOptionalAnswers = optionalAnswers.filter(
        (option) => option.trim() !== ""
      );
      if (filteredOptionalAnswers.length < 2) {
        setError("At least 2 answer options are required");
        return;
      }

      // Find the correct option index from current selection
      const validCorrectOptionIndex = correctOptionIndex || 0;
      const clampedOptionsToPresent = Math.max(
        2,
        Math.min(filteredOptionalAnswers.length, Number(optionsToPresent) || 2)
      );

      console.log("=== SAVING QUESTION ===");
      console.log("Question text:", text);
      console.log("Assessment ID:", assessmentId);
      console.log("Options:", filteredOptionalAnswers);
      console.log("Correct option index:", validCorrectOptionIndex);
      console.log("Options to present:", clampedOptionsToPresent);

      let savedQuestion;

      if (question?.id) {
        console.log("Updating existing question with ID:", question.id);
        // Update existing question
        savedQuestion = await updateQuestion({
          id: question.id,
          updates: {
            text,
            // No correctOptionId field needed anymore
            optionsToPresent: clampedOptionsToPresent,
            imageDataUrl,
          },
        }).unwrap();

        console.log("Updated question:", savedQuestion);

        // Handle options for existing question
        if (filteredOptionalAnswers.length > 0) {
          // First, delete all existing options to prevent duplicates
          try {
            for (const existingOption of loadedOptions) {
              await fetch(
                `${
                  process.env.REACT_APP_API_URL || "http://localhost:8091"
                }/question-options/${existingOption.id}`,
                {
                  method: "DELETE",
                }
              );
            }
          } catch (error) {
            console.error("Error deleting existing options:", error);
          }

          // Then create new options individually
          let savedOptions = [];
          try {
            for (const optionText of filteredOptionalAnswers) {
              console.log("Question ID being used:", question.id);
              console.log("Question object:", question);

              const optionData = {
                optionText,
                questionId: question.id,
              };

              console.log("Creating individual option:", optionData);

              const response = await fetch(
                `${
                  process.env.REACT_APP_API_URL || "http://localhost:8091"
                }/question-options`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(optionData),
                }
              );

              if (response.ok) {
                const savedOption = await response.json();
                savedOptions.push(savedOption);
                console.log("Created option:", savedOption);
              } else {
                const errorText = await response.text();
                console.error("Failed to create option:", errorText);
              }
            }

            // Set the correct option using is_correct field
            if (
              savedOptions.length > 0 &&
              validCorrectOptionIndex < savedOptions.length
            ) {
              const correctOptionId = savedOptions[validCorrectOptionIndex].id;
              console.log(
                "Setting correct option:",
                correctOptionId,
                "for index:",
                validCorrectOptionIndex
              );
              try {
                await fetch(
                  `${
                    process.env.REACT_APP_API_URL || "http://localhost:8091"
                  }/question-options/${correctOptionId}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isCorrect: true }),
                  }
                );
                console.log("Successfully set correct option");
              } catch (error) {
                console.error("Error setting correct option:", error);
              }
            }
          } catch (error) {
            console.error(
              "Error creating options for existing question:",
              error
            );
          }
        }
      } else {
        console.log("Creating new question for assessment:", assessmentId);
        // Create new question
        savedQuestion = await createQuestion({
          text,
          // No correctOptionId field needed anymore
          optionsToPresent: clampedOptionsToPresent,
          imageDataUrl,
          assessment: { id: assessmentId },
        }).unwrap();

        console.log("Created question:", savedQuestion);

        // Create options for the new question

        if (savedQuestion.id && filteredOptionalAnswers.length > 0) {
          const options = filteredOptionalAnswers.map((optionText) => ({
            optionText,
            questionId: savedQuestion.id,
          }));

          console.log("Creating options for question:", savedQuestion.id);
          console.log("Options to create:", options);

          let savedOptions = [];
          try {
            for (const optionText of filteredOptionalAnswers) {
              console.log("Saved Question ID being used:", savedQuestion.id);
              console.log("Saved Question object:", savedQuestion);

              const optionData = {
                optionText,
                questionId: savedQuestion.id,
              };

              console.log("Creating individual option:", optionData);

              const response = await fetch(
                `${
                  process.env.REACT_APP_API_URL || "http://localhost:8091"
                }/question-options`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(optionData),
                }
              );

              if (response.ok) {
                const savedOption = await response.json();
                savedOptions.push(savedOption);
                console.log("Created option:", savedOption);
              } else {
                const errorText = await response.text();
                console.error("Failed to create option:", errorText);
              }
            }

            console.log("Created options:", savedOptions);
          } catch (error) {
            console.error("Error creating options:", error);
            throw error;
          }

          // Set the correct option using is_correct field
          if (
            savedOptions.length > 0 &&
            validCorrectOptionIndex < savedOptions.length
          ) {
            const correctOptionId = savedOptions[validCorrectOptionIndex].id;
            console.log(
              "Setting correct option:",
              correctOptionId,
              "for index:",
              validCorrectOptionIndex
            );
            try {
              await fetch(
                `${
                  process.env.REACT_APP_API_URL || "http://localhost:8091"
                }/question-options/${correctOptionId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ isCorrect: true }),
                }
              );
              console.log("Successfully set correct option");
            } catch (error) {
              console.error("Error setting correct option:", error);
            }
          }
        }
      }

      // Call the parent onSave callback to refresh the question bank
      console.log("Calling onSave callback with saved question data");
      onSave({
        id: savedQuestion.id,
        text,
        correctOptionIndex: validCorrectOptionIndex,
        optionalAnswers: filteredOptionalAnswers,
        optionsToPresent: clampedOptionsToPresent,
        imageDataUrl,
      });

      console.log("Question saved successfully!");
    } catch (error) {
      console.error("Error saving question:", error);
      setError("Error saving question. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
  const outlineButtonClass =
    "px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const removeButtonClass =
    "p-2 rounded-md hover:bg-red-100 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500";

  // Combine current optional answers with loaded options from database
  const currentNonEmptyOptions = optionalAnswers.filter(
    (o) => o && o.trim() !== ""
  );
  const loadedOptionTexts = loadedOptions.map((opt) => opt.optionText);
  const nonEmptyOptions = [
    ...new Set([...currentNonEmptyOptions, ...loadedOptionTexts]),
  ].filter((opt) => opt && opt.trim() !== "");

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          {question ? "Edit Question" : "Create New Question"}
        </h2>
        <p className={cardDescriptionClass}>
          Define the question, its correct answer, a bank of optional answers,
          and an optional image.
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
          <span htmlFor="question-text" className={labelClass}>
            Question
          </span>
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
              <img
                src={imageDataUrl}
                alt="Question"
                className="max-h-40 rounded"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={inputClass}
            />
            {imageDataUrl && (
              <button
                type="button"
                className={removeButtonClass}
                onClick={handleClearImage}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </button>
            )}
          </div>
        </div>

        <div className={formGroupClass}>
          <span htmlFor="correct-answer" className={labelClass}>
            Correct Answer
          </span>
          <select
            id="correct-answer"
            value={correctOptionIndex}
            onChange={(e) => setCorrectOptionIndex(parseInt(e.target.value))}
            className={inputClass}
          >
            {nonEmptyOptions.map((optionText, index) => (
              <option key={index} value={index}>
                {optionText || `Option ${index + 1}`}
              </option>
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
              {/* Individual save buttons disabled - use main Save Question button instead */}
              {false &&
                question?.id &&
                modifiedOptions.has(index) &&
                option.trim() && (
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs rounded ${
                      savingOptions.has(index)
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    onClick={() => handleSaveOption(index)}
                    disabled={savingOptions.has(index)}
                  >
                    {savingOptions.has(index) ? "Saving..." : "Save"}
                  </button>
                )}
              {(optionalAnswers.length > 2 ||
                (question?.id && loadedOptions.length > 2)) && (
                <button
                  type="button"
                  className={removeButtonClass}
                  onClick={() => handleRemoveOption(index)}
                  title="Remove option"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove option</span>
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={outlineButtonClass}
              onClick={handleAddOption}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Option
            </button>
          </div>
        </div>

        <div className={formGroupClass}>
          <span htmlFor="options-to-present" className={labelClass}>
            Number of Options to Display to User
          </span>
          <input
            id="options-to-present"
            type="number"
            value={optionsToPresent}
            onChange={(e) =>
              setOptionsToPresent(
                Math.max(
                  2,
                  Math.min(
                    nonEmptyOptions.length || 2,
                    Number(e.target.value) || 2
                  )
                )
              )
            }
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
          <button
            type="button"
            className={primaryButtonClass}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Question & Options"}
          </button>
        </div>
      </div>
    </div>
  );
}
QuestionForm.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    correctOptionIndex: PropTypes.number,
    optionalAnswers: PropTypes.arrayOf(PropTypes.string),
    optionsToPresent: PropTypes.number,
    imageDataUrl: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  assessmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

QuestionForm.defaultProps = {
  question: null,
  assessmentId: null,
};
