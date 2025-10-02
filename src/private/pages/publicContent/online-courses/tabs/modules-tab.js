import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ModuleForm from '../forms/module-form';
import {
  useCreateModuleMutation,
  useGetModulesByCourseQuery,
} from '../../../../../redux/apiSlice';

export default function ModulesTab({ selectedCourse, allModules, setAllModules }) {
  const [editingModule, setEditingModule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [createModule] = useCreateModuleMutation();
  const { data: fetchedModules, isLoading, isError } = useGetModulesByCourseQuery(
    selectedCourse.id,
    { skip: !selectedCourse?.id },
  );

  // Prefer API modules; fall back to any provided local state
  let modules = [];
  if (Array.isArray(fetchedModules)) {
    modules = fetchedModules;
  } else if (Array.isArray(allModules)) {
    modules = allModules.filter((m) => m.courseId === selectedCourse.id);
  }

  const handleAddModule = () => {
    setEditingModule(null);
    setShowForm(true);
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowForm(true);
  };

  const handleDeleteModule = (id) => {
    setAllModules(allModules.filter((m) => m.id !== id));
  };

  const handleSaveModule = async (newModule) => {
    try {
      if (!newModule.id) {
        await createModule({
          name: newModule.name,
          description: newModule.description,
          course: { id: selectedCourse.id },
        }).unwrap();
      } // edits can be wired similarly with edit mutation
      setShowForm(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create module', e);
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
      <ModuleForm
        module={editingModule}
        onSave={handleSaveModule}
        onCancel={handleCancelForm}
        courseId={selectedCourse.id}
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          Modules for
          {' '}
          {selectedCourse.name}
        </h2>
        <button type="button" onClick={handleAddModule} className={buttonClass}>
          <Plus className="mr-2 h-4 w-4" />
          {' '}
          Add New Module
        </button>
      </div>
      <div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th scope="col" className={tableHeadClass}>Name</th>
                <th scope="col" className={tableHeadClass}>Description</th>
                <th scope="col" className={`${tableHeadClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                if (isLoading) {
                  return (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500">Loading modules...</td>
                    </tr>
                  );
                }
                if (isError) {
                  return (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-red-600">Failed to load modules.</td>
                    </tr>
                  );
                }
                if (modules.length === 0) {
                  return (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No modules for this course yet.</td>
                    </tr>
                  );
                }
                return modules.map((module, index) => (
                  <tr
                    key={module.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                  >
                    <td className={`${tableCellClass} font-medium`}>{module.name}</td>
                    <td className={tableCellClass}>{module.description}</td>
                    <td className={`${tableCellClass} text-right`}>
                      <button
                        type="button"
                        className={actionButtonClass}
                        onClick={() => handleEditModule(module)}
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        className={actionButtonClass}
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
ModulesTab.propTypes = {
  selectedCourse: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  allModules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      courseId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
  ).isRequired,
  setAllModules: PropTypes.func.isRequired,
};
