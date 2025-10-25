import {
  Clock, Users, Plane, ArrowLeft, User, CheckCircle,
} from 'lucide-react';
import PropTypes from 'prop-types';

export default function CourseHeader({
  title, subtitle, duration, students, endDate, username, isEnrolled, onEnrollClick, onLoginClick,
}) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-4">
          <button type="button" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Courses</span>
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-600">SMS Course</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start space-x-4 mb-4 lg:mb-0">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-lg text-gray-600 mb-3">{subtitle}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{students}</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <span>{endDate ? new Date(endDate).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Actions */}
          <div className="flex items-center space-x-3">
            <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              Share Course
            </button>
            {!username && (
              <button 
                type="button" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={onLoginClick}
              >
                Login to Enroll
              </button>
            )}
            {username && !isEnrolled && (
              <button 
                type="button" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={onEnrollClick}
              >
                Enroll Now
              </button>
            )}
            {username && isEnrolled && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Enrolled</span>
              </div>
            )}
            {username && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{username}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

CourseHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  students: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  username: PropTypes.string,
  isEnrolled: PropTypes.bool,
  onEnrollClick: PropTypes.func,
  onLoginClick: PropTypes.func,
};

CourseHeader.defaultProps = {
  endDate: '',
  username: null,
  isEnrolled: false,
  onEnrollClick: () => {},
  onLoginClick: () => {},
};
