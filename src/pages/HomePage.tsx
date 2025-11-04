"use client";

import type React from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  CheckCircle,
  BarChart3,
  Users,
  ArrowRight,
  Award,
  Sun,
  Moon,
} from "lucide-react";
import {
  useGetPublishedCoursesQuery,
  useGetCompletedCoursesQuery,
  useGetStandaloneAssessmentsQuery,
  useGetEnrollmentCountQuery,
} from "../redux/apiSlice";
import { getToken, isTokenExpired } from "../utils/jwtUtils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { data: publishedCourses = [], isLoading: publishedLoading } =
    useGetPublishedCoursesQuery();
  const { data: completedCourses = [], isLoading: completedLoading } =
    useGetCompletedCoursesQuery();
  const { data: standaloneAssessments = [], isLoading: assessmentsLoading } =
    useGetStandaloneAssessmentsQuery();

  // Get enrollment counts for courses (for display) - using a component approach
  const EnrollmentCount: React.FC<{ courseId: number }> = ({ courseId }) => {
    const { data: countData } = useGetEnrollmentCountQuery(courseId, { skip: !courseId });
    const count = countData?.count || 0;
    return count > 0 ? (
      <span>{count === 1 ? "1 student enrolled" : `${count} students enrolled`}</span>
    ) : null;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-full shadow-sm">
            Available
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-sm">
            Draft
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-full">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


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
                  UCAA - OCMS
                </h1>
                <p className="text-xs text-sky-600 dark:text-sky-300">
                  Staff Online Assessment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              <Link
                to="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-300"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400 dark:bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-blue-400 dark:bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-32 right-1/3 w-80 h-80 bg-indigo-500 dark:bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 dark:from-sky-300 dark:via-blue-300 dark:to-sky-400 bg-clip-text text-transparent">
              Elevate Staff Competency
            </span>
            <br />
            <span className="text-slate-800 dark:text-white">
              Maintain Aviation Excellence
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Uganda Civil Aviation Authority's comprehensive online assessment platform
            designed to evaluate and enhance staff competency across critical
            aviation safety and operational domains.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Access Assessments
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/browse"
              className="px-8 py-4 border-2 border-sky-500/40 text-sky-300 rounded-lg font-semibold hover:border-sky-400 hover:bg-sky-500/10 transition-all duration-300"
            >
              Browse All Programs
            </Link>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-800/50 border-y border-sky-200 dark:border-sky-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: Award,
                title: "Certifications",
                desc: "Official competency credentials",
              },
              {
                icon: BarChart3,
                title: "Progress Tracking",
                desc: "Real-time assessment analytics",
              },
              {
                icon: Users,
                title: "All Departments",
                desc: "Customized for all department needs",
              },
              {
                icon: CheckCircle,
                title: "Safety Compliance",
                desc: "Regulatory adherence",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-sky-200 dark:border-sky-500/20 hover:border-sky-400 dark:hover:border-sky-500/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <feature.icon className="h-10 w-10 text-sky-600 dark:text-sky-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Programs and Assessments Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Active Programs
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Comprehensive evaluation pathways for aviation professionals
            </p>
          </div>

          {publishedLoading || assessmentsLoading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500/30 border-t-sky-500"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Loading programs...
                </p>
              </div>
            </div>
          ) : publishedCourses.length === 0 && standaloneAssessments.length === 0 ? (
            <div className="text-center py-20">
              <Plane className="mx-auto h-16 w-16 text-sky-500/30 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                No assessment programs available yet!!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Check back soon for new competency assessments
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Render Courses */}
              {publishedCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-sky-500/20 dark:hover:shadow-sky-500/20 transition-all duration-300 overflow-hidden border border-sky-200 dark:border-sky-500/20 hover:border-sky-400 dark:hover:border-sky-500/50"
                >
                  <div className="h-2 bg-gradient-to-r from-sky-500 to-blue-500 group-hover:h-3 transition-all"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">
                        {course.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(course.status)}
                        <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 border border-sky-200">Course</span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-500 mb-4 pb-4 border-b border-sky-200 dark:border-sky-500/10">
                      {course.endDate && (
                        <span>
                          Course expires on: {formatDate(course.endDate)}
                        </span>
                      )}
                      <EnrollmentCount courseId={course.id} />
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

              {/* Render Assessments */}
              {standaloneAssessments.map((a) => (
                <div key={a.id} className="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden border border-purple-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/50">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 group-hover:h-3 transition-all"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">{a.name}</h4>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">Assessment</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">{a.description}</p>
                    <button
                      onClick={async () => {
                        const token = getToken();
                        if (!token || isTokenExpired(token)) {
                          navigate("/login", { state: { warning: "Please login to access assessments" } });
                          return;
                        }

                        // Check if assessment belongs to a course
                        // Note: We'll need to fetch the assessment to check courseId
                        // For now, we'll navigate and let the quiz page handle it
                        navigate(`/assessment/${a.id}`);
                      }}
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
        </div>
      </section>

      {/* Completed Courses Section */}
      {completedCourses.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100/30 dark:bg-slate-800/30 border-t border-sky-200 dark:border-sky-500/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Completed Assessments
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Your certified competency achievements
              </p>
            </div>

            {completedLoading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/30 border-t-emerald-500"></div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Loading assessments...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/20 transition-all duration-300 overflow-hidden border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500/50"
                  >
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:h-3 transition-all"></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">
                          {course.name}
                        </h4>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-500 mb-4 pb-4 border-b border-emerald-200 dark:border-emerald-500/10">
                        <span>
                          {course.startDate
                            ? `Started: ${formatDate(course.startDate)}`
                            : "Start date TBD"}
                        </span>
                        <span>
                          {course.endDate
                            ? `Completed: ${formatDate(course.endDate)}`
                            : "End date TBD"}
                        </span>
                      </div>
                      <Link
                        to={`/course/${course.id}`}
                        className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                      >
                        View Certificate
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-600/20 dark:to-blue-600/20 border-t border-sky-200 dark:border-sky-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Ready to Demonstrate Your Competency?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
            Access our complete assessment library and advance your professional
            credentials
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-sky-500/30"
          >
            Begin Assessment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-200 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 border-t border-sky-200 dark:border-sky-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-2 rounded-lg shadow-lg shadow-sky-500/30">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    UCAA
                  </h3>
                  <p className="text-xs text-sky-600 dark:text-sky-400">
                    Staff Competency Assessment Platform
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-500 max-w-xs text-sm">
                Uganda Civil Aviation Authority - Ensuring Excellence in
                Aviation Safety
              </p>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-500">
              <p>© 2025 UCAA. All rights reserved.</p>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-800 pt-8 text-center text-slate-600 dark:text-slate-500 text-sm">
            Committed to Aviation Safety & Professional Excellence
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
