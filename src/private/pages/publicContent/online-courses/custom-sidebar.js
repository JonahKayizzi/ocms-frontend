import React from 'react';
import PropTypes from 'prop-types';
import {
  LayoutDashboard, BookOpen, FileText, LibraryBig, ClipboardCheck,
} from 'lucide-react';

export default function CustomSidebar({
  isCollapsed, // For desktop collapse state
  isMobileOpen, // For mobile open state
  onCloseMobile, // Callback to close mobile sidebar
  currentView,
  setCurrentView,
  courseManagementActiveTab,
  handleNavigateToTab, // Updated to use this for all course management navigation
  setSelectedCourse, // Added to reset selected course when navigating from sidebar
}) {
  const linkClass = (isActive) => `flex items-center p-2 rounded-md text-sm font-medium transition-colors duration-200 ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
  }`;

  const iconClass = 'mr-3 h-5 w-5';

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${isCollapsed ? 'md:w-16' : 'md:w-64'}
        ${isMobileOpen ? 'w-64' : 'w-0'} // Mobile sidebar specific width
        overflow-hidden
      `}
    >
      <div className="p-4 flex items-center justify-between">
        <div className={`flex items-center ${isCollapsed && 'justify-center w-full'} ${!isMobileOpen && 'hidden md:flex'}`}>
          <LayoutDashboard className="h-7 w-7 text-blue-600" />
          <span className={`ml-3 text-xl font-semibold text-gray-800 ${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        <button
          type="button"
          onClick={() => { setCurrentView('dashboard'); onCloseMobile(); setSelectedCourse(null); }}
          className={linkClass(currentView === 'dashboard')}
        >
          <LayoutDashboard className={iconClass} />
          <span className={`${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>Dashboard</span>
        </button>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className={`px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>
            Course Management
          </h3>
          <ul className="mt-2 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => handleNavigateToTab('modules', true)} // Force course selection, then go to modules
                className={linkClass(currentView === 'course-management' && courseManagementActiveTab === 'modules')}
              >
                <BookOpen className={iconClass} />
                <span className={`${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>Modules</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavigateToTab('lessons', true)} // Force course selection, then go to lessons
                className={linkClass(currentView === 'course-management' && courseManagementActiveTab === 'lessons')}
              >
                <FileText className={iconClass} />
                <span className={`${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>Lessons</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavigateToTab('materials', true)} // Force course selection, then go to materials
                className={linkClass(currentView === 'course-management' && courseManagementActiveTab === 'materials')}
              >
                <LibraryBig className={iconClass} />
                <span className={`${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>Materials</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className={`px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>
            Online Assessments
          </h3>
          <ul className="mt-2 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => { setCurrentView('assessments-hub'); onCloseMobile(); setSelectedCourse(null); }}
                className={linkClass(currentView === 'assessments-hub')}
              >
                <ClipboardCheck className={iconClass} />
                <span className={`${isCollapsed && 'hidden'} ${!isMobileOpen && 'md:block'}`}>Assessments</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

CustomSidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  isMobileOpen: PropTypes.bool.isRequired,
  onCloseMobile: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  courseManagementActiveTab: PropTypes.string.isRequired,
  handleNavigateToTab: PropTypes.func.isRequired,
  setSelectedCourse: PropTypes.func.isRequired,
};
