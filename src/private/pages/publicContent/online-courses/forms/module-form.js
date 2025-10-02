import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function ModuleForm({
  module, onSave, onCancel, courseId,
}) {
  const [name, setName] = useState(module?.name || '');
  const [description, setDescription] = useState(module?.description || '');

  useEffect(() => {
    if (module) {
      setName(module.name);
      setDescription(module.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [module]);

  const handleSave = () => {
    onSave({
      id: module?.id,
      name,
      description,
      courseId, // Ensure courseId is passed
    });
  };

  const cardClass = 'bg-white rounded-lg shadow p-6';
  const cardHeaderClass = 'mb-4';
  const cardTitleClass = 'text-2xl font-bold text-gray-800';
  const cardDescriptionClass = 'text-gray-600 mt-1';
  const formGroupClass = 'grid gap-2';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const buttonGroupClass = 'flex justify-end gap-2 mt-6';
  const primaryButtonClass = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200';
  const ghostButtonClass = 'px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200';

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>{module ? 'Edit Module' : 'Create New Module'}</h2>
        <p className={cardDescriptionClass}>Define the module&apos;s name and description.</p>
      </div>
      <div className="grid gap-6">
        <div className={formGroupClass}>
          <span htmlFor="module-name" className={labelClass}>Module Name</span>
          <input
            id="module-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Introduction to Safety"
            className={inputClass}
          />
        </div>
        <div className={formGroupClass}>
          <span htmlFor="module-description" className={labelClass}>Description</span>
          <textarea
            id="module-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the module"
            className={`${inputClass} min-h-[80px]`}
          />
        </div>
        <div className={buttonGroupClass}>
          <button type="button" className={ghostButtonClass} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClass} onClick={handleSave}>
            Save Module
          </button>
        </div>
      </div>
    </div>
  );
}

ModuleForm.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
