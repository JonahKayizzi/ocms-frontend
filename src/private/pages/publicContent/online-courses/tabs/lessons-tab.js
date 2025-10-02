import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import LessonForm from '../forms/lesson-form';
import { useGetModulesByCourseQuery, useCreateLessonMutation, useGetLessonsByCourseQuery, useDeleteLessonMutation, useUpdateLessonMutation } from '../../../../../redux/apiSlice';

export default function LessonsTab({
  selectedCourse,
  allLessons,
  setAllLessons,
  courseModules = [],
}) {
  const [editingLesson, setEditingLesson] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
  const { data: fetchedModules } = useGetModulesByCourseQuery(
    selectedCourse.id,
    { skip: !selectedCourse?.id },
  );

  // Load lessons from API
  const { data: fetchedLessons, isLoading, isError } = useGetLessonsByCourseQuery(
    selectedCourse.id,
    { skip: !selectedCourse?.id },
  );
  const lessons = Array.isArray(fetchedLessons) ? fetchedLessons : [];

  // Modules options for the dropdown: prefer API; fallback to provided prop
  let moduleOptions = [];
  if (Array.isArray(fetchedModules)) {
    moduleOptions = fetchedModules.map((m) => ({ id: m.id, name: m.name }));
  } else if (Array.isArray(courseModules)) {
    moduleOptions = courseModules.map((m) => ({ id: m.id, name: m.name }));
  }

  const handleAddLesson = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleDeleteLesson = async (id) => {
    try {
      await deleteLesson(id).unwrap();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete lesson', e);
    }
  };

  const handleSaveLesson = async (newLesson) => {
    try {
      if (!newLesson.id) {
        await createLesson({
          name: newLesson.name,
          description: newLesson.description,
          content: newLesson.content,
          loomVideoUrl: newLesson.loomVideoUrl || '',
          course: { id: selectedCourse.id },
          module: newLesson.moduleId ? { id: Number(newLesson.moduleId) } : null,
        }).unwrap();
      } else {
        await updateLesson({ id: Number(newLesson.id), updates: {
          name: newLesson.name,
          description: newLesson.description,
          content: newLesson.content,
          loomVideoUrl: newLesson.loomVideoUrl || '',
          module: newLesson.moduleId ? { id: Number(newLesson.moduleId) } : null,
        }}).unwrap();
      }
      setShowForm(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create lesson', e);
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
      <LessonForm
        lesson={editingLesson}
        onSave={handleSaveLesson}
        onCancel={handleCancelForm}
        courseId={selectedCourse.id}
        modules={moduleOptions}
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          Lessons for
          {' '}
          {selectedCourse.name}
        </h2>
        <button type="button" onClick={handleAddLesson} className={buttonClass}>
          <Plus className="mr-2 h-4 w-4" />
          {' '}
          Add New Lesson
        </button>
      </div>
      <div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th scope="col" className={tableHeadClass}>Name</th>
                <th scope="col" className={tableHeadClass}>Module</th>
                <th scope="col" className={tableHeadClass}>Description</th>
                <th scope="col" className={tableHeadClass}>Content</th>
                <th scope="col" className={tableHeadClass}>Video</th>
                <th scope="col" className={`${tableHeadClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No lessons for this course yet.</td>
                </tr>
              ) : (
                lessons.map((lesson, index) => (
                  <tr
                    key={lesson.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                  >
                    <td className={`${tableCellClass} font-medium`}>{lesson.name}</td>
                    <td className={tableCellClass}>{lesson.module?.name || '—'}</td>
                    <td className={tableCellClass}>{lesson.description}</td>
                    <td className={tableCellClass}>
                      {lesson.content ? 'Has content' : '—'}
                    </td>
                    <td className={tableCellClass}>
                      {lesson.loomVideoUrl ? (
                        <a
                          href={lesson.loomVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className={`${tableCellClass} text-right`}>
                      <button type="button" className={actionButtonClass} onClick={() => handleEditLesson(lesson)}>
                        <Edit className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        className={actionButtonClass}
                        onClick={() => handleDeleteLesson(lesson.id)}
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
LessonsTab.propTypes = {
  selectedCourse: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  allLessons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      loomVideoUrl: PropTypes.string,
    }),
  ).isRequired,
  setAllLessons: PropTypes.func.isRequired,
  courseModules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

LessonsTab.defaultProps = {
  courseModules: [],
};
