import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AssessmentForm from '../forms/assessment-form';
import {
  useGetAssessmentsByCourseQuery,
  useGetStandaloneAssessmentsQuery,
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useDeleteAssessmentMutation,
} from '../../../../../redux/apiSlice';

export default function AssessmentsTab({
  selectedCourse,
  standaloneCategory,
  filterCategory,
}) {
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // API data
  const courseId = selectedCourse?.id;
  const {
    data: courseAssessments,
    isLoading: courseAssessmentsLoading,
    isError: courseAssessmentsError,
  } = useGetAssessmentsByCourseQuery(courseId, { skip: !courseId });

  const {
    data: standaloneAssessments,
    isLoading: standaloneAssessmentsLoading,
    isError: standaloneAssessmentsError,
  } = useGetStandaloneAssessmentsQuery(undefined, { skip: !!courseId });

  const [createAssessment] = useCreateAssessmentMutation();
  const [updateAssessment] = useUpdateAssessmentMutation();
  const [deleteAssessment, { isLoading: deleting }] = useDeleteAssessmentMutation();

  const apiAssessments = useMemo(() => {
    if (courseId) return Array.isArray(courseAssessments) ? courseAssessments : [];
    // Backend does not support categories on assessments yet; show all standalone
    return Array.isArray(standaloneAssessments) ? standaloneAssessments : [];
  }, [courseId, courseAssessments, standaloneAssessments]);

  const loading = courseId ? courseAssessmentsLoading : standaloneAssessmentsLoading;
  const error = courseId ? courseAssessmentsError : standaloneAssessmentsError;

  const handleAddAssessment = () => {
    setEditingAssessment(null);
    setShowForm(true);
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setShowForm(true);
  };

  const handleDeleteAssessment = async (id) => {
    await deleteAssessment(id);
  };

  const handleSaveAssessment = async (newAssessment) => {
    if (newAssessment?.id) {
      await updateAssessment({ id: newAssessment.id, updates: newAssessment });
    } else {
      const payload = { ...newAssessment };
      if (courseId) payload.course = { id: courseId };
      await createAssessment(payload);
    }
    setShowForm(false);
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

  let rowsContent;
  if (loading) {
    rowsContent = (
      <tr>
        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading assessments...</td>
      </tr>
    );
  } else if (error) {
    rowsContent = (
      <tr>
        <td colSpan="5" className="px-6 py-4 text-center text-red-600">Failed to load assessments.</td>
      </tr>
    );
  } else if (apiAssessments.length === 0) {
    rowsContent = (
      <tr>
        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
          {selectedCourse ? 'No assessments for this course yet.' : 'No standalone assessments yet.'}
        </td>
      </tr>
    );
  } else {
    rowsContent = apiAssessments.map((assessment) => (
      <tr key={assessment.id} className="odd:bg-white even:bg-gray-50">
        <td className={`${tableCellClass} font-medium`}>{assessment.name}</td>
        <td className={tableCellClass}>{assessment.description}</td>
        <td className={tableCellClass}>{assessment.questionCount}</td>
        <td className={tableCellClass}>{assessment.questionsToPresent}</td>
        <td className={`${tableCellClass} text-right`}>
          <button type="button" className={actionButtonClass} onClick={() => handleEditAssessment(assessment)}>
            <Edit className="h-4 w-4 text-gray-700" />
            <span className="sr-only">Edit</span>
          </button>
          <button type="button" className={actionButtonClass} onClick={() => handleDeleteAssessment(assessment.id)} disabled={deleting}>
            <Trash2 className="h-4 w-4 text-red-600" />
            <span className="sr-only">Delete</span>
          </button>
        </td>
      </tr>
    ));
  }

  if (showForm) {
    return (
      <AssessmentForm
        assessment={editingAssessment}
        onSave={handleSaveAssessment}
        onCancel={handleCancelForm}
        courseId={selectedCourse?.id}
      />
    );
  }

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <h2 className={cardTitleClass}>
          {selectedCourse ? (
            `Assessments for ${selectedCourse.name}`
          ) : (
            `Standalone Assessments${(standaloneCategory || filterCategory) ? ` - ${(standaloneCategory || filterCategory)}` : ''}`
          )}
        </h2>
        <button type="button" onClick={handleAddAssessment} className={buttonClass}>
          <Plus className="mr-2 h-4 w-4" />
          {' '}
          Add New Assessment
        </button>
      </div>
      <div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th scope="col" className={tableHeadClass}>Name</th>
                <th scope="col" className={tableHeadClass}>Description</th>
                <th scope="col" className={tableHeadClass}>Total Questions</th>
                <th scope="col" className={tableHeadClass}>Questions to Present</th>
                <th scope="col" className={`${tableHeadClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rowsContent}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
AssessmentsTab.propTypes = {
  selectedCourse: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }),
  standaloneCategory: PropTypes.string,
  filterCategory: PropTypes.string,
};

AssessmentsTab.defaultProps = {
  selectedCourse: null,
  standaloneCategory: '',
  filterCategory: '',
};
