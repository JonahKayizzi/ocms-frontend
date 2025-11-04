"use client";

import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  ArrowRight,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  useGetPublishedCoursesQuery,
  useGetCompletedCoursesQuery,
  useGetUserProgressQuery,
  useGetAssessmentResultsQuery,
  useGetUserCoursesQuery,
  useGetStandaloneAssessmentsQuery,
} from "../redux/apiSlice";
import {
  getToken,
  getUserInfo,
  removeToken,
  getUsernameFromToken,
} from "../utils/jwtUtils";

const UserDashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = getToken();
  const userInfo = token ? getUserInfo(token) : null;
  const username = token ? getUsernameFromToken(token) : null;
  const userDepartment = userInfo?.category || "General"; // Assuming category contains department

  // Get user's courses (filtered by department on backend if supported)
  const { data: allPublishedCourses = [], isLoading: coursesLoading } =
    useGetPublishedCoursesQuery();

  // Filter courses by department (client-side filtering if backend doesn't support it)
  const departmentCourses = allPublishedCourses.filter(
    (course) =>
      !course.department ||
      course.department === userDepartment ||
      userDepartment === "General"
  );

  // Get completed courses from API
  const { data: completedCoursesData = [], isLoading: completedLoading } =
    useGetCompletedCoursesQuery();

  // Get enrolled courses for the user
  const { data: enrolledCourses = [], isLoading: enrolledLoading } =
    useGetUserCoursesQuery(username || "", { skip: !username });

  // Get user progress for all courses
  const { data: allUserProgress = [], isLoading: progressLoading } =
    useGetUserProgressQuery(username || "", { skip: !username });

  // Create a map of courseId -> progress for quick lookup
  const progressMap = new Map(
    allUserProgress.map((p) => [p.courseId, p])
  );

  // Build in-progress courses list:
  // 1. Courses with progress data that are in_progress or not_started (but not completed)
  // 2. Enrolled courses that don't have progress data yet (newly enrolled)
  const inProgressFromProgress = allUserProgress.filter(
    (progress) =>
      (progress.status === "in_progress" || progress.status === "not_started") &&
      progress.progressPercentage < 100
  );

  // Find enrolled courses that don't have progress data yet
  const enrolledWithoutProgress = enrolledCourses.filter(
    (course) => !progressMap.has(course.id)
  );

  // Combine and transform to unified format
  const userProgress = [
    ...inProgressFromProgress.map((progress) => ({
      courseId: progress.courseId,
      courseName: progress.courseName,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      progressPercentage: progress.progressPercentage,
      lastAccessed: progress.lastAccessed,
      status: progress.status,
    })),
    ...enrolledWithoutProgress.map((course) => ({
      courseId: course.id,
      courseName: course.name,
      completedLessons: 0,
      totalLessons: 0, // Will be updated when progress is available
      progressPercentage: 0,
      lastAccessed: course.updatedAt || course.createdAt,
      status: "not_started" as const,
    })),
  ];

  // Get completed courses from progress data (courses with 100% completion)
  const completedCoursesFromProgress = allUserProgress
    .filter((progress) => progress.status === "completed" || progress.progressPercentage === 100)
    .map((progress) => ({
      id: progress.courseId,
      name: progress.courseName,
      progress: 100,
      completedDate: progress.lastAccessed,
    }));

  // Combine completed courses from both sources (prefer progress data)
  const completedCourses = completedCoursesFromProgress.length > 0
    ? completedCoursesFromProgress
    : completedCoursesData.map((course) => ({
      id: course.id,
      name: course.name,
      progress: 100,
      completedDate: course.updatedAt || course.endDate,
    }));

  // Get assessment results from API
  const { data: quizResults = [], isLoading: resultsLoading } =
    useGetAssessmentResultsQuery(username || "", { skip: !username });

  // Get available standalone assessments
  const { data: standaloneAssessments = [], isLoading: assessmentsLoading } =
    useGetStandaloneAssessmentsQuery();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartAssessment = (assessmentId: number) => {
    navigate(`/assessment/${assessmentId}`);
  };

  if (!token || !userInfo) {
    navigate("/login", {
      state: { warning: "Please login to access dashboard" },
    });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 dark:from-slate-900 dark:via-navy-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-sky-200 dark:border-sky-500/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-2.5 rounded-lg shadow-lg shadow-sky-500/30">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                  UCAA Dashboard
                </h1>
                <p className="text-xs text-sky-600 dark:text-sky-300">
                  {userDepartment} Department
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {username}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all duration-300 border border-sky-200 dark:border-sky-500/20"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Welcome back, {username}!
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Here's your learning progress and available courses for{" "}
            {userDepartment} Department
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-sky-200 dark:border-sky-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Available Courses
                </p>
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {coursesLoading ? "..." : departmentCourses.length}
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-sky-500 dark:text-sky-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-sky-200 dark:border-sky-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Completed Courses
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedLoading ? "..." : completedCourses.length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-500 dark:text-emerald-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-sky-200 dark:border-sky-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Assessments Taken
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {resultsLoading ? "..." : quizResults.length}
                </p>
              </div>
              <FileText className="h-10 w-10 text-purple-500 dark:text-purple-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-sky-200 dark:border-sky-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {resultsLoading
                    ? "..."
                    : quizResults.length > 0
                      ? Math.round(
                        quizResults.reduce((sum, r) => sum + r.percentage, 0) /
                        quizResults.length
                      )
                      : 0}
                  {!resultsLoading && "%"}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-amber-500 dark:text-amber-400 opacity-50" />
            </div>
          </div>
        </section>

        {/* Available Courses Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
              Available Courses for {userDepartment}
            </h3>
          </div>
          {coursesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500/30 border-t-sky-500"></div>
            </div>
          ) : departmentCourses.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 text-center border border-sky-200 dark:border-sky-500/20">
              <BookOpen className="mx-auto h-12 w-12 text-sky-500/30 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No courses available for your department yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white dark:bg-slate-800/50 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-sky-500/20 dark:hover:shadow-sky-500/20 transition-all duration-300 overflow-hidden border border-sky-200 dark:border-sky-500/20 hover:border-sky-400 dark:hover:border-sky-500/50"
                >
                  <div className="h-2 bg-gradient-to-r from-sky-500 to-blue-500 group-hover:h-3 transition-all"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">
                        {course.name}
                      </h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-500 mb-4 pb-4 border-b border-sky-200 dark:border-sky-500/10">
                      {course.startDate && (
                        <span>Starts: {formatDate(course.startDate)}</span>
                      )}
                      {course.endDate && (
                        <span>Ends: {formatDate(course.endDate)}</span>
                      )}
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
                    >
                      Start Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Assessments Section */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Available Assessments
          </h3>
          {assessmentsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500"></div>
            </div>
          ) : standaloneAssessments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-500/20">
              <FileText className="mx-auto h-12 w-12 text-purple-500/30 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No standalone assessments available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standaloneAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="group bg-white dark:bg-slate-800/50 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden border border-purple-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/50"
                >
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:h-3 transition-all"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">
                        {assessment.name}
                      </h4>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                        Assessment
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {assessment.description}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-500 mb-4 pb-4 border-b border-purple-200 dark:border-purple-500/10">
                      {assessment.questionCount > 0 && (
                        <span>
                          {assessment.questionsToPresent || assessment.questionCount} questions
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleStartAssessment(assessment.id)}
                      className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* In Progress Courses */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Courses In Progress
          </h3>
          {progressLoading || enrolledLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500/30 border-t-amber-500"></div>
            </div>
          ) : userProgress.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 text-center border border-amber-200 dark:border-amber-500/20">
              <Clock className="mx-auto h-12 w-12 text-amber-500/30 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No courses in progress. Start a course to see your progress here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProgress.map((progress) => (
                <div
                  key={progress.courseId}
                  className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {progress.courseName}
                    </h4>
                    <span className="px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      In Progress
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>
                        {progress.totalLessons > 0 ? (
                          <>
                            {progress.completedLessons} of {progress.totalLessons}{" "}
                            lessons completed
                          </>
                        ) : (
                          "Course enrolled - ready to start"
                        )}
                      </span>
                      <span>
                        {progress.totalLessons > 0
                          ? `${progress.progressPercentage}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(progress.progressPercentage, 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      Last accessed: {formatDate(progress.lastAccessed)}
                    </span>
                    <Link
                      to={`/course/${progress.courseId}`}
                      className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold text-sm transition-colors"
                    >
                      Continue
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Courses */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Completed Courses
          </h3>
          {completedLoading || progressLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/30 border-t-emerald-500"></div>
            </div>
          ) : completedCourses.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 text-center border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500/30 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No completed courses yet. Complete a course to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-emerald-200 dark:border-emerald-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {course.name}
                    </h4>
                    <CheckCircle className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>Completed</span>
                      <span>{formatDate(course.completedDate)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-sm transition-colors"
                  >
                    Review Course
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assessment Results */}
        <section>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Assessment Results
          </h3>
          {resultsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500"></div>
            </div>
          ) : quizResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-500/20">
              <FileText className="mx-auto h-12 w-12 text-purple-500/30 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No assessment results yet. Complete an assessment to see your results here.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-sky-200 dark:border-sky-500/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-sky-200 dark:border-sky-500/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Assessment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Date Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-200 dark:divide-sky-500/20">
                    {quizResults.map((result) => (
                      <tr
                        key={result.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-800 dark:text-white">
                            {result.assessmentName || `Assessment #${result.assessmentId}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {result.courseName || (result.courseId ? `Course #${result.courseId}` : "Standalone Assessment")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">
                              {result.score}/{result.totalQuestions}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${result.percentage >= 80
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : result.percentage >= 60
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                }`}
                            >
                              {result.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDateTime(result.completedAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
