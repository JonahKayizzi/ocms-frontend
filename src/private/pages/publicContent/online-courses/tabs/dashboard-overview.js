import React from 'react';
import PropTypes from 'prop-types';
import {
  Plus, BookOpen, ClipboardCheck, Clock, Upload, Edit, Trash2,
} from 'lucide-react';

export default function DashboardOverview({
  courses = [],
  onCreateCourseClick,
  onEditCourse,
  onDeleteCourse,
  onPublishCourse,
  onDeactivateCourse,
  onNavigateToModulesClick,
  onNavigateToAssessmentsClick,
  onNavigateToMaterialsClick,
}) {
  const recentActivities = [
    { id: 1, description: "Created new module: 'Introduction to Safety'", time: '2 hours ago' },
    { id: 2, description: "Edited assessment: 'Emergency Procedures'", time: 'Yesterday' },
    { id: 3, description: "Added 3 new questions to 'Fire Safety Basics' assessment", time: '3 days ago' },
    { id: 4, description: "Uploaded 'Safety Handbook' material", time: '1 week ago' },
  ];

  const cardClass = 'bg-white rounded-lg shadow p-6';
  const cardTitleClass = 'text-xl font-semibold text-gray-800 mb-4';
  const buttonClass = 'flex items-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200';
  const activityItemClass = 'flex items-start gap-3';
  const activityTextClass = 'text-sm font-medium text-gray-700';
  const activityTimeClass = 'text-xs text-gray-500';

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: 'Deactivated', class: 'bg-red-100 text-red-800' },
      1: { text: 'Published', class: 'bg-green-100 text-green-800' },
      2: { text: 'Draft', class: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'Completed', class: 'bg-blue-100 text-blue-800' },
    };
    const statusInfo = statusMap[status] || statusMap[2];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Only show courses that are drafts or have not yet ended
  const now = new Date();
  const manageableCourses = (Array.isArray(courses) ? courses : []).filter((c) => (
    c?.status === 2 // Draft
    || !c?.endDate
    || (new Date(c.endDate) > now)
  ));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className={`${cardClass} md:col-span-2 lg:col-span-1`}>
        <h2 className={cardTitleClass}>Quick Actions</h2>
        <div className="grid gap-4">
          <button type="button" className={buttonClass} onClick={onCreateCourseClick}>
            <Plus className="mr-2 h-4 w-4" />
            {' '}
            Create New Course
          </button>
          <button type="button" className={buttonClass} onClick={onNavigateToModulesClick}>
            <BookOpen className="mr-2 h-4 w-4" />
            {' '}
            Add New Module
          </button>
          <button type="button" className={buttonClass} onClick={onNavigateToAssessmentsClick}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {' '}
            Create New Assessment
          </button>
          <button type="button" className={buttonClass} onClick={onNavigateToMaterialsClick}>
            <Upload className="mr-2 h-4 w-4" />
            {' '}
            Upload New Material
          </button>
        </div>
      </div>

      <div className={`${cardClass} md:col-span-2 lg:col-span-2`}>
        <h2 className={cardTitleClass}>Course Management</h2>
        {manageableCourses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No courses available for management. Only drafts or courses that have not yet ended are shown here.</p>
        ) : (
          <div className="space-y-4">
            {manageableCourses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(course.status)}
                    {course.startDate && (
                      <span className="text-xs text-gray-500">
                        Starts:
                        {' '}
                        {new Date(course.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => onEditCourse(course)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {/* Publish/Deactivate actions moved to Course Management page */}
                  <button
                    type="button"
                    onClick={() => onDeleteCourse(course.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {manageableCourses.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                Showing 5 of
                {' '}
                {manageableCourses.length}
                {' '}
                courses
              </p>
            )}
          </div>
        )}
      </div>

      <div className={`${cardClass} md:col-span-2 lg:col-span-2`}>
        <h2 className={cardTitleClass}>Published Courses</h2>
        {courses.filter((c) => c.status === 1).length === 0 ? (
          <p className="text-gray-500">No published courses yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.filter((c) => c.status === 1).map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate mr-2">{course.name}</h3>
                    {getStatusBadge(course.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{course.description}</p>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {course.startDate ? (
                    <span>Starts {new Date(course.startDate).toLocaleDateString()}</span>
                  ) : (
                    <span>Start date not set</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder for other dashboard widgets */}
      <div className={`${cardClass} md:col-span-2 lg:col-span-3`}>
        <h2 className={cardTitleClass}>Course Statistics</h2>
        <div className="h-48 w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
          Charts and data will go here
        </div>
      </div>
    </div>
  );
}

DashboardOverview.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.number,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
  ),
  onCreateCourseClick: PropTypes.func.isRequired,
  onEditCourse: PropTypes.func.isRequired,
  onDeleteCourse: PropTypes.func.isRequired,
  onPublishCourse: PropTypes.func.isRequired,
  onDeactivateCourse: PropTypes.func.isRequired,
  onNavigateToModulesClick: PropTypes.func.isRequired,
  onNavigateToAssessmentsClick: PropTypes.func.isRequired,
  onNavigateToMaterialsClick: PropTypes.func.isRequired,
};

DashboardOverview.defaultProps = {
  courses: [],
};
