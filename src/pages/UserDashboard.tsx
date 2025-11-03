"use client";

import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  FileText,
  ArrowRight,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useGetPublishedCoursesQuery } from "../redux/apiSlice";
import {
  getToken,
  getUserInfo,
  removeToken,
  getUsernameFromToken,
} from "../utils/jwtUtils";
import { useState } from "react";

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

  // Mock data for completed courses and quiz results (replace with actual API calls)
  const [completedCourses] = useState([
    {
      id: 1,
      name: "Air Traffic Control Fundamentals",
      progress: 100,
      completedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Aviation Safety Management",
      progress: 100,
      completedDate: "2024-01-10",
    },
  ]);

  const [quizResults] = useState([
    {
      id: 1,
      assessmentName: "ATC Basics Assessment",
      courseName: "Air Traffic Control Fundamentals",
      score: 85,
      totalQuestions: 20,
      percentage: 85,
      completedAt: "2024-01-15T10:30:00",
    },
    {
      id: 2,
      assessmentName: "Safety Procedures Quiz",
      courseName: "Aviation Safety Management",
      score: 18,
      totalQuestions: 20,
      percentage: 90,
      completedAt: "2024-01-10T14:20:00",
    },
  ]);

  const [userProgress] = useState([
    {
      courseId: 3,
      courseName: "Navigation Systems",
      completedLessons: 5,
      totalLessons: 8,
      progressPercentage: 63,
      lastAccessed: "2024-01-20",
      status: "in_progress" as const,
    },
  ]);

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
                  {completedCourses.length}
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
                  {quizResults.length}
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
                  {quizResults.length > 0
                    ? Math.round(
                        quizResults.reduce((sum, r) => sum + r.percentage, 0) /
                          quizResults.length
                      )
                    : 0}
                  %
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

        {/* In Progress Courses */}
        {userProgress.length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Courses In Progress
            </h3>
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
                        {progress.completedLessons} of {progress.totalLessons}{" "}
                        lessons completed
                      </span>
                      <span>{progress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progressPercentage}%` }}
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
          </section>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Completed Courses
            </h3>
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
          </section>
        )}

        {/* Assessment Results */}
        {quizResults.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Assessment Results
            </h3>
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
                            {result.assessmentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {result.courseName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">
                              {result.score}/{result.totalQuestions}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                result.percentage >= 80
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
          </section>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
