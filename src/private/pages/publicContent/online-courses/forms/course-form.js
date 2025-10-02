import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { usePublishCourseMutation, useDeactivateCourseMutation } from '../../../../../redux/apiSlice';

export default function CourseForm({ course, onSave, onCancel }) {
  const [publishCourse] = usePublishCourseMutation();
  const [deactivateCourse] = useDeactivateCourseMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(course?.status ?? 2);

  // Format dates for datetime-local input when course prop changes
  useEffect(() => {
    if (course) {
      setName(course.name || '');
      setDescription(course.description || '');
      setGoals(course.learningGoals || course.objectives || '');
      setStatus(course.status ?? 2);

      // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
      if (course.startDate) {
        const startDateStr = new Date(course.startDate).toISOString().slice(0, 16);
        setStartDate(startDateStr);
      } else {
        setStartDate('');
      }

      if (course.endDate) {
        const endDateStr = new Date(course.endDate).toISOString().slice(0, 16);
        setEndDate(endDateStr);
      } else {
        setEndDate('');
      }
    } else {
      // Reset form for new course
      setName('');
      setDescription('');
      setGoals('');
      setStartDate('');
      setEndDate('');
      setStatus(2);
    }
  }, [course]);

  const handleSave = () => {
    const normalizeDate = (dt) => {
      if (!dt) return null;
      return dt.length === 16 ? `${dt}:00` : dt;
    };

    const courseData = {
      id: course?.id,
      name,
      description,
      learningGoals: goals,
      objectives: goals,
      startDate: normalizeDate(startDate),
      endDate: normalizeDate(endDate),
    };

    onSave(courseData);
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

  return (
    <div className={cardClass}>
      <div className={cardHeaderClass}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cardTitleClass}>{course ? 'Edit Course' : 'Create New Course'}</h2>
            <p className={cardDescriptionClass}>Define the course details, learning goals, and objectives.</p>
          </div>
          {course?.id && (
            <div className="flex items-center gap-2">
              {status === 2 && (
                <button type="button" className={primaryButtonClass} onClick={async () => { try { await publishCourse(course.id).unwrap(); setStatus(1); } catch (e) { /* noop */ } }}>
                  <Eye className="mr-2 h-4 w-4" /> Publish
                </button>
              )}
              {status === 1 && (
                <button type="button" className={primaryButtonClass.replace('bg-blue-500','bg-red-500').replace('hover:bg-blue-600','hover:bg-red-600')} onClick={async () => { try { await deactivateCourse(course.id).unwrap(); setStatus(0); } catch (e) { /* noop */ } }}>
                  <EyeOff className="mr-2 h-4 w-4" /> Deactivate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-6">
        <div className={formGroupClass}>
          <span htmlFor="course-name" className={labelClass}>Course Name</span>
          <input
            id="course-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Advanced Safety Protocols"
            className={inputClass}
          />
        </div>
        <div className={formGroupClass}>
          <span htmlFor="course-description" className={labelClass}>Description</span>
          <textarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the course content"
            className={textareaClass}
          />
        </div>
        <div className={formGroupClass}>
          <span htmlFor="goals" className={labelClass}>Learning Goals & Objectives</span>
          <textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={"Enter bullet points, one per line.\nExample:\n• Understand safety principles\n• Identify hazards"}
            className={textareaClass}
          />
          <p className="text-sm text-gray-500">
            Enter bullet items (one per line). They will be displayed as a bulleted list on the course page.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={formGroupClass}>
            <span htmlFor="start-date" className={labelClass}>Course Start Date</span>
            <input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
            <p className="text-sm text-gray-500">
              When the course becomes available to learners.
            </p>
          </div>
          <div className={formGroupClass}>
            <span htmlFor="end-date" className={labelClass}>Course End Date</span>
            <input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
            <p className="text-sm text-gray-500">
              When the course will be automatically marked as completed.
            </p>
          </div>
        </div>
        <div className={buttonGroupClass}>
          <button type="button" className={ghostButtonClass} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClass} onClick={handleSave}>
            Save Course
          </button>
        </div>
      </div>
    </div>
  );
}
CourseForm.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    learningGoals: PropTypes.string,
    objectives: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

CourseForm.defaultProps = {
  course: null,
};
