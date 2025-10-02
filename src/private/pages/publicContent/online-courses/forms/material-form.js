import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MaterialForm({
  material, onSave, onCancel, courseId,
}) {
  const [name, setName] = useState(material?.name || '');
  const [type, setType] = useState(material?.type || 'Document');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState(material?.description || '');

  useEffect(() => {
    if (material) {
      setName(material.name);
      setType(material.type);
      setFile(null);
      setDescription(material.description || '');
    } else {
      setName('');
      setType('Document');
      setFile(null);
      setDescription('');
    }
  }, [material]);

  const handleSave = () => {
    onSave({
      id: material?.id,
      name,
      type,
      file,
      description,
      courseId,
    });
  };

  const cardClass = 'bg-white rounded-lg shadow p-6';
  const cardHeaderClass = 'mb-4';
  const cardTitleClass = 'text-2xl font-bold text-gray-800';
  const cardDescriptionClass = 'text-gray-600 mt-1';
  const formGroupClass = 'grid gap-2';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const inputClass = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const selectClass = 'mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md';
  const buttonGroupClass = 'flex justify-end gap-2 mt-6';
  const primaryButtonClass = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200';
  const ghostButtonClass = 'px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200';

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>{material ? 'Edit Material' : 'Add New Material'}</h2>
        <p className={cardDescriptionClass}>Provide details for the course material.</p>
      </div>
      <div className="grid gap-6">
        <div className={formGroupClass}>
          <span htmlFor="material-name" className={labelClass}>Material Name</span>
          <input
            id="material-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Safety Regulations PDF"
            className={inputClass}
          />
        </div>
        <div className={formGroupClass}>
          <span htmlFor="material-type" className={labelClass}>Material Type</span>
          <select id="material-type" value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
            <option value="Document">Document</option>
            <option value="Video">Video</option>
            <option value="Audio">Audio</option>
            <option value="Image">Image</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={formGroupClass}>
          <span htmlFor="material-file" className={labelClass}>Upload File</span>
          <input
            id="material-file"
            type="file"
            onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            className={inputClass}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.jpg,.jpeg,.png,.txt"
          />
        </div>
        <div className={formGroupClass}>
          <span htmlFor="material-description" className={labelClass}>Description (Optional)</span>
          <textarea
            id="material-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the material"
            className={`${inputClass} min-h-[80px]`}
          />
        </div>
        <div className={buttonGroupClass}>
          <button type="button" className={ghostButtonClass} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClass} onClick={handleSave}>
            Save Material
          </button>
        </div>
      </div>
    </div>
  );
}
MaterialForm.propTypes = {
  material: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    type: PropTypes.string,
    fileUrl: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
