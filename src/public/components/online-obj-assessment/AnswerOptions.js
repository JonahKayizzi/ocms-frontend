'use client';

import PropTypes from 'prop-types';

export default function AnswerOption({
  option,
  index,
  questionId,
  isSelected,
  onSelect,
}) {
  const handleClick = () => {
    onSelect(index);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input
        type="radio"
        id={`option-${questionId}-${index}`}
        name={`quiz-option-${questionId}`}
        value={index}
        checked={isSelected}
        onChange={handleClick}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <label
        htmlFor={`option-${questionId}-${index}`}
        className="flex-1 cursor-pointer font-medium text-gray-900"
      >
        {option}
      </label>
    </div>
  );
}

AnswerOption.propTypes = {
  option: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  questionId: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
