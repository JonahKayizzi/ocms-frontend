/* eslint-disable no-lonely-if */
import React, { useState, useEffect } from 'react';
import { Menu, BookOpen, LogOut, User } from 'lucide-react'; // For mobile menu icon and course icon
import { useNavigate } from 'react-router-dom';
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  usePublishCourseMutation,
  useDeactivateCourseMutation,
} from '../../../../redux/apiSlice';
import CustomSidebar from './custom-sidebar';
import DashboardOverview from './tabs/dashboard-overview';
import ModulesTab from './tabs/modules-tab';
import LessonsTab from './tabs/lessons-tab';
import MaterialsTab from './tabs/materials-tab';
import AssessmentsTab from './tabs/assessments-tab';
import CourseForm from './forms/course-form';
import { getToken, getUserInfo, removeToken, isTokenExpired } from '../../../../utils/jwtUtils';

export default function CourseManagementDashboard() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // For mobile menu open
  const [currentUser, setCurrentUser] = useState(null);

  // State to manage the overall active view: 'dashboard', 'course-management',
  //  'create-course', 'assessments-hub', 'standalone-assessments'
  const [currentView, setCurrentView] = useState('dashboard');
  // State to manage the active tab when in 'course-management' view
  const [courseManagementActiveTab, setCourseManagementActiveTab] = useState('modules');

  // Courses from API
  const {
    data: fetchedCourses, isLoading: coursesLoading, isError: coursesError, error: coursesErrorObj,
  } = useGetCoursesQuery();
  const [courses, setCourses] = useState([]);
  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [deactivateCourse] = useDeactivateCourseMutation();

  // State for editing course
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    if (Array.isArray(fetchedCourses)) {
      setCourses(fetchedCourses);
    }
  }, [fetchedCourses]);
  // State for the currently selected course
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Dummy data for modules, lessons, materials, assessments, now associated with courses
  const [allModules, setAllModules] = useState([
    {
      id: 'm1', courseId: 'c1', name: 'Module 1: Intro to Safety', description: 'Overview of safety.',
    },
    {
      id: 'm2', courseId: 'c1', name: 'Module 2: Hazard Control', description: 'Controlling hazards.',
    },
    {
      id: 'm3', courseId: 'c2', name: 'Module A: Emergency Planning', description: 'Planning for emergencies.',
    },
  ]);
  const [allLessons, setAllLessons] = useState([
    {
      id: 'l1', courseId: 'c1', moduleId: 'm1', name: 'Lesson 1.1: What is Safety?', description: 'Defining safety.', loomVideoUrl: 'https://www.loom.com/share/example1',
    },
    {
      id: 'l2', courseId: 'c1', moduleId: 'm1', name: 'Lesson 1.2: Safety Culture', description: 'Building a safety culture.', loomVideoUrl: 'https://www.loom.com/share/example2',
    },
    {
      id: 'l3', courseId: 'c2', moduleId: 'm3', name: 'Lesson A.1: Evacuation Routes', description: 'Identifying routes.', loomVideoUrl: 'https://www.loom.com/share/example3',
    },
  ]);
  const [allMaterials, setAllMaterials] = useState([
    {
      id: 'mat1', courseId: 'c1', name: 'Safety Handbook', type: 'Document', url: 'https://example.com/safety-handbook.pdf', description: 'Main safety guide.',
    },
    {
      id: 'mat2', courseId: 'c2', name: 'Emergency Response Plan', type: 'Document', url: 'https://example.com/erp.pdf', description: 'Detailed ERP.',
    },
  ]);
  // Assessments are now fetched via API inside AssessmentsTab

  // Non-course assessment categories
  const [assessmentCategory, setAssessmentCategory] = useState(''); // e.g., 'OJT', 'Proficiency'

  // Check authentication on mount
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      navigate('/login', { state: { warning: 'Please login to access this page' } });
      return;
    }

    const userInfo = getUserInfo(token);
    if (userInfo) {
      setCurrentUser(userInfo);
    } else {
      navigate('/login', { state: { warning: 'Invalid session. Please login again.' } });
    }
  }, [navigate]);

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileSidebarOpen(false); // Close mobile sidebar if resizing to desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
    navigate('/login', { state: { success: 'Logged out successfully' } });
  };

  const handleCreateCourse = async (newCourse) => {
    try {
      if (newCourse.id) {
        // Editing existing course
        await updateCourse({ id: newCourse.id, updates: { ...newCourse } }).unwrap();
        setEditingCourse(null);
      } else {
        // Creating new course
        await createCourse({ ...newCourse }).unwrap();
      }
      setCurrentView('dashboard'); // Go back to dashboard after saving
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save course', err);
    }
  };

  const handleCancelCourseForm = () => {
    setCurrentView('dashboard'); // Go back to dashboard
    setEditingCourse(null);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCurrentView('create-course');
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId).unwrap();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete course', err);
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await publishCourse(courseId).unwrap();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to publish course', err);
    }
  };

  const handleDeactivateCourse = async (courseId) => {
    try {
      await deactivateCourse(courseId).unwrap();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to deactivate course', err);
    }
  };

  // This function is used for navigation from sidebar or quick actions
  const handleNavigateToTab = (tabName, forceCourseSelection = false) => {
    if (forceCourseSelection) {
      setSelectedCourse(null); // Force showing course selection list
    }
    setCourseManagementActiveTab(tabName);
    setCurrentView('course-management');
    setIsMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    // courseManagementActiveTab is already set by handleNavigateToTab
    setCurrentView('course-management');
    setIsMobileSidebarOpen(false); // Close mobile sidebar on selection
  };

  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
    setCurrentView('course-management'); // Go back to course list
  };

  const handleOpenAssessmentsHub = () => {
    setSelectedCourse(null);
    setAssessmentCategory('');
    setCurrentView('assessments-hub');
  };

  const handleChooseAssessmentForCourse = () => {
    setAssessmentCategory('');
    setCourseManagementActiveTab('assessments');
    setCurrentView('course-management');
  };

  const handleChooseAssessmentStandalone = () => {
    setAssessmentCategory('');
    setCurrentView('standalone-assessments');
  };

  let contentToRender;
  if (currentView === 'create-course') {
    contentToRender = (
      <CourseForm
        course={editingCourse}
        onSave={handleCreateCourse}
        onCancel={handleCancelCourseForm}
      />
    );
  } else if (currentView === 'dashboard') {
    contentToRender = (
      <DashboardOverview
        courses={courses}
        onCreateCourseClick={() => setCurrentView('create-course')}
        onEditCourse={handleEditCourse}
        onDeleteCourse={handleDeleteCourse}
        onPublishCourse={handlePublishCourse}
        onDeactivateCourse={handleDeactivateCourse}
        onNavigateToModulesClick={() => handleNavigateToTab('modules', true)}
        onNavigateToAssessmentsClick={() => handleNavigateToTab('assessments', true)}
        onNavigateToMaterialsClick={() => handleNavigateToTab('materials', true)}
      />
    );
  } else if (currentView === 'assessments-hub') {
    // First choose course-based or standalone
    contentToRender = (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessments</h2>
        <p className="text-gray-600 mb-6">Choose how you want to manage assessments.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button" onClick={handleChooseAssessmentForCourse} className="flex-1 p-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">For a Course</button>
          <button type="button" onClick={handleChooseAssessmentStandalone} className="flex-1 p-4 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">Standalone (OJT, Proficiency, etc.)</button>
        </div>
      </div>
    );
  } else if (currentView === 'standalone-assessments') {
    // Pick category then show assessments tab only
    contentToRender = (
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Standalone Assessments</h2>
        <div className="mb-4">
          <label htmlFor="assessment-category" className="block text-sm font-medium text-gray-700 mb-1">
            Select Category
            <select id="assessment-category" value={assessmentCategory} onChange={(e) => setAssessmentCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">-- Choose category --</option>
              <option value="OJT">OJT</option>
              <option value="Proficiency">Proficiency</option>
              <option value="Certification">Certification</option>
              <option value="Recurrent">Recurrent</option>
            </select>
          </label>
        </div>

        {assessmentCategory && (
          <div className="w-full space-y-6">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button type="button" className="py-2 px-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600">Assessments</button>
            </div>
            <div className="p-4">
              <div className="w-full">
                {/* Category Card */}
                <div className="w-full rounded-lg border border-gray-200 bg-white shadow">
                  <div className="px-4 py-3 border-b bg-gray-900 text-gray-100 rounded-t-lg">
                    {`Standalone Assessments - ${assessmentCategory}`}
                  </div>
                  <div className="p-4">
                    <AssessmentsTab
                      selectedCourse={null}
                      standaloneCategory={assessmentCategory}
                      filterCategory={assessmentCategory}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else { // currentView === "course-management"
    if (!selectedCourse) {
      // Display list of courses to select from
      contentToRender = (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Course to Manage</h2>
          {coursesLoading && (
            <p className="text-gray-600">Loading courses...</p>
          )}
          {coursesError && (
            <p className="text-red-600">
              Failed to load courses
              {coursesErrorObj?.status ? ` (status ${coursesErrorObj.status})` : ''}
              .
            </p>
          )}
          {!coursesLoading && !coursesError && courses.length === 0 ? (
            <p className="text-gray-600">No courses created yet. Use &quot;Create New Course&quot; to add one.</p>
          ) : (!coursesLoading && !coursesError && (
            <ul className="space-y-3">
              {courses.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectCourse(course)}
                    className="flex items-center w-full p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-left"
                  >
                    <BookOpen className="mr-3 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-lg font-medium text-gray-800">{course.name}</p>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      );
    } else {
      // Display tabs for the selected course
      contentToRender = (
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Managing:
              {' '}
              {selectedCourse.name}
            </h2>
            <button
              type="button"
              onClick={handleBackToCourseSelection}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              ← Back to Courses
            </button>
          </div>
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium ${courseManagementActiveTab === 'modules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setCourseManagementActiveTab('modules')}
            >
              Modules
            </button>
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium ${courseManagementActiveTab === 'lessons' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setCourseManagementActiveTab('lessons')}
            >
              Lessons
            </button>
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium ${courseManagementActiveTab === 'materials' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setCourseManagementActiveTab('materials')}
            >
              Materials
            </button>
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium ${courseManagementActiveTab === 'assessments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setCourseManagementActiveTab('assessments')}
            >
              Assessments
            </button>
          </div>

          <div className="p-4">
            {courseManagementActiveTab === 'modules' && (
              <ModulesTab
                selectedCourse={selectedCourse}
                allModules={allModules}
                setAllModules={setAllModules}
              />
            )}
            {courseManagementActiveTab === 'lessons' && (
              <LessonsTab
                selectedCourse={selectedCourse}
                allLessons={allLessons}
                setAllLessons={setAllLessons}
              />
            )}
            {courseManagementActiveTab === 'materials' && (
              <MaterialsTab
                selectedCourse={selectedCourse}
                allMaterials={allMaterials}
                setAllMaterials={setAllMaterials}
              />
            )}
            {courseManagementActiveTab === 'assessments' && (
              <AssessmentsTab
                selectedCourse={selectedCourse}
              />
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <CustomSidebar
        isCollapsed={isSidebarCollapsed} // For desktop
        isMobileOpen={isMobileSidebarOpen} // For mobile
        onCloseMobile={() => setIsMobileSidebarOpen(false)} // Callback to close mobile sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'assessments-hub') handleOpenAssessmentsHub();
          else setCurrentView(view);
        }}
        courseManagementActiveTab={courseManagementActiveTab}
        handleNavigateToTab={handleNavigateToTab}
        setSelectedCourse={setSelectedCourse} // Allow sidebar to reset selected course
      />

      <div className={`flex-1 p-6 transition-all duration-300
        ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
        ml-0 // No margin on mobile, sidebar overlays
        w-full // Base width for small screens
        md:w-[calc(100%-4rem)] md:group-[.sidebar-collapsed]:w-[calc(100%-16rem)] // Adjust width for desktop
      `}
      >
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Toggle button for mobile sidebar */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
              aria-label="Toggle Mobile Sidebar"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            {/* Toggle button for desktop sidebar collapse */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden md:block"
              aria-label="Toggle Desktop Sidebar"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentView === 'dashboard' && 'Admin Dashboard'}
              {currentView === 'create-course' && 'Create New Course'}
              {currentView === 'course-management' && (selectedCourse ? `Course Management: ${selectedCourse.name}` : 'Course Management')}
              {currentView === 'assessments-hub' && 'Assessments'}
              {currentView === 'standalone-assessments' && 'Standalone Assessments'}
            </h1>
          </div>

          {/* User info and logout */}
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">
                  {currentUser.username}
                </span>
                {currentUser.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>

        {contentToRender}
      </div>
    </div>
  );
}
