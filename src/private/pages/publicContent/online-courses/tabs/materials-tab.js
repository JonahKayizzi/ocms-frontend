import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Plus, Edit, Trash2, Download,
} from 'lucide-react';
import MaterialForm from '../forms/material-form';
import { useCreateMaterialMutation, useGetMaterialsByCourseQuery, useDeleteMaterialMutation, useUpdateMaterialMutation, useUploadMaterialMutation } from '../../../../../redux/apiSlice';

export default function MaterialsTab({ selectedCourse, allMaterials, setAllMaterials }) {
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [createMaterial] = useCreateMaterialMutation();
  const [uploadMaterial] = useUploadMaterialMutation();

  // Load materials from API
  const { data: fetchedMaterials, isLoading, isError } = useGetMaterialsByCourseQuery(selectedCourse.id, { skip: !selectedCourse?.id });
  const [deleteMaterial] = useDeleteMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const materials = Array.isArray(fetchedMaterials) ? fetchedMaterials : [];

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDeleteMaterial = async (id) => {
    try { await deleteMaterial(id).unwrap(); } catch (e) { /* eslint-disable-next-line no-console */ console.error('Delete failed', e); }
  };

  const handleSaveMaterial = async (newMaterial) => {
    try {
      // Build multipart form data for upload endpoint
      const formData = new FormData();
      formData.append('courseId', String(selectedCourse.id));
      if (newMaterial.file) formData.append('file', newMaterial.file);
      if (newMaterial.name) formData.append('name', newMaterial.name);
      if (newMaterial.description) formData.append('description', newMaterial.description);
      if (newMaterial.type) formData.append('fileType', newMaterial.type);

      // Use fetch directly for multipart as RTK Query baseQuery is JSON-oriented
      await uploadMaterial(formData).unwrap();
      setShowForm(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save material', e);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const cardClass = 'bg-white rounded-lg shadow p-6';
  const cardHeaderClass = 'flex flex-row items-center justify-between mb-4';
  const cardTitleClass = 'text-2xl font-bold text-gray-800';
  const buttonClass = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center';
  const tableClass = 'min-w-full divide-y divide-gray-200';
  const tableHeaderClass = 'bg-gray-900';
  const tableHeadClass = 'px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider';
  const tableCellClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  const actionButtonClass = 'p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (showForm) {
    return (
      <MaterialForm
        material={editingMaterial}
        onSave={handleSaveMaterial}
        onCancel={handleCancelForm}
        courseId={selectedCourse.id}
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          Materials for
          {' '}
          {selectedCourse.name}
        </h2>
        <button type="button" onClick={handleAddMaterial} className={buttonClass}>
          <Plus className="mr-2 h-4 w-4" />
          {' '}
          Add New Material
        </button>
      </div>
      <div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th scope="col" className={tableHeadClass}>Name</th>
                <th scope="col" className={tableHeadClass}>Type</th>
                <th scope="col" className={tableHeadClass}>File</th>
                <th scope="col" className={`${tableHeadClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading materials...</td></tr>
              ) : isError ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-red-600">Failed to load materials.</td></tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No materials for this course yet.</td>
                </tr>
              ) : (
                materials.map((material, index) => (
                  <tr
                    key={material.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                  >
                    <td className={`${tableCellClass} font-medium`}>{material.name}</td>
                    <td className={tableCellClass}>{material.fileType || material.type}</td>
                    <td className={tableCellClass}>
                      <a href={`${(material.fileUrl || material.url || '').startsWith('http') ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8091')}${material.fileUrl || material.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {(material.fileUrl || material.url || '').split('/').pop()}
                      </a>
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <button type="button" className={actionButtonClass} onClick={() => handleEditMaterial(material)}>
                        <Edit className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <a href={`${(material.fileUrl || material.url || '').startsWith('http') ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8091')}${material.fileUrl || material.url}`} download className={actionButtonClass}>
                        <Download className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">Download</span>
                      </a>
                      <button
                        type="button"
                        className={actionButtonClass}
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
MaterialsTab.propTypes = {
  selectedCourse: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  allMaterials: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    courseId: PropTypes.string.isRequired,
  })).isRequired,
  setAllMaterials: PropTypes.func.isRequired,
};
