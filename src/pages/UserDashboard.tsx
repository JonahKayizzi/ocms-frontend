"use client";

import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane,
  BookOpen,
  TrendingUp,
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
  useGetUserProgressQuery,
  useGetStandaloneAssessmentsQuery,
  useGetAssessmentsByCourseQuery,
  useGetCourseProgressQuery,
  useIsEnrolledQuery,
  useGetUserQuizAttemptsQuery,
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

  // We don't use a user-wide enrolled courses endpoint; enrollment is checked per course

  // Skip user-wide progress endpoint (not implemented on backend). We'll use per-course progress instead.
  const { isLoading: progressLoading } = useGetUserProgressQuery(username || "", { skip: true });

  // We no longer build a userProgress list from a user-wide endpoint.

  // Enrollment is checked per-course; no precomputed enrolled course ids

  // Completed count will be derived by the per-course cards; for the top stat, show ... while enrolled loading
  const completedCourses: any[] = [];

  // Use attempts from DB (replaces deprecated assessment-results endpoint)
  const { data: myAttempts = [], isLoading: resultsLoading } = useGetUserQuizAttemptsQuery(
    username || "",
    { skip: !username, refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true }
  );

  // Get available standalone assessments
  const { data: standaloneAssessments = [], isLoading: assessmentsLoading } =
    useGetStandaloneAssessmentsQuery();

  // myAttempts fetched above

  const handleLogout = () => {
    removeToken();
    navigate("/");
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

  // (Removed status/completion badges per request)

  const handleStartAssessment = (assessmentId: number) => {
    navigate(`/assessment/${assessmentId}`);
  };

  const HasAssessmentBadge: React.FC<{ courseId: number }> = ({ courseId }) => {
    const { data: assessments = [] } = useGetAssessmentsByCourseQuery(courseId, { skip: !courseId });
    if (!assessments || assessments.length === 0) return null;
    return (
      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
        Has assessment
      </span>
    );
  };

  // Card for Available Courses that hides itself if the user is enrolled or already has progress
  const AvailableCourseCard: React.FC<{ course: any; participantId: string; isHiddenByProgress?: boolean }> = ({ course, participantId }) => {
    const { data: isEnrolledResp } = useIsEnrolledQuery({ courseId: course.id, participantId }, { skip: !course?.id || !participantId });
    const isEnrolled = !!isEnrolledResp?.enrolled;
    const { data: progressData } = useGetCourseProgressQuery({ courseId: course.id, participantId }, { skip: !course?.id || !participantId });
    const hasProgress = Number(progressData?.completed || 0) > 0 || Number(progressData?.percent || 0) > 0;
    if (isEnrolled || hasProgress) return null;

    return (
      <div
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
            <div className="flex items-center gap-2">
              <HasAssessmentBadge courseId={course.id} />
            </div>
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
    );
  };

  if (!token || !userInfo) {
    navigate("/login", {
      state: { warning: "Please login to access dashboard" },
    });
    return null;
  }

  // Child card that uses the SAME per-course progress endpoint as course page
  const CourseProgressCard: React.FC<{ course: any; participantId: string; section: "inProgress" | "completed" }> = ({ course, participantId, section }) => {
    const { data: isEnrolledResp } = useIsEnrolledQuery({ courseId: course.id, participantId }, { skip: !course?.id || !participantId });
    const { data: progressData, isLoading } = useGetCourseProgressQuery({ courseId: course.id, participantId }, { skip: !course?.id || !participantId });
    const completed = Number(progressData?.completed || 0);
    const total = Number(progressData?.total || 0);
    const percent = Math.round(Number(progressData?.percent || (total > 0 ? (completed / total) * 100 : 0)));
    const isCompleted = total > 0 ? completed >= total : percent >= 100;
    const isEnrolled = !!isEnrolledResp?.enrolled;

    if (isLoading) {
      return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-500/20">
          <div className="animate-pulse h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      );
    }

    // Only show for enrolled users
    if (!isEnrolled) return null;
    if (section === "inProgress" && isCompleted) return null;
    if (section === "completed" && !isCompleted) return null;

    return (
      <div className={`bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border ${isCompleted ? "border-emerald-200 dark:border-emerald-500/20" : "border-amber-200 dark:border-amber-500/20"}`}>
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{course.name}</h4>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>
              {total > 0 ? (
                <>
                  {completed} of {total} lessons completed
                </>
              ) : (
                "Course enrolled - ready to start"
              )}
            </span>
            <span>{`${Math.max(percent, 0)}%`}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div className={`${isCompleted ? "bg-emerald-500 dark:bg-emerald-400" : "bg-amber-500 dark:bg-amber-400"} h-2 rounded-full transition-all duration-300`} style={{ width: `${Math.max(percent, 0)}%` }} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          {course.endDate ? (
            <span className="text-xs text-slate-500 dark:text-slate-500">Ends: {formatDate(course.endDate)}</span>
          ) : <span />}
          <Link to={`/course/${course.id}`} className={`inline-flex items-center ${isCompleted ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300" : "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"} font-semibold text-sm transition-colors`}>
            {isCompleted ? "Review Course" : "Continue"}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    );
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
                  UCAA OCMS
                </h1>
                <p className="text-xs text-sky-600 dark:text-sky-300">
                  {userDepartment}
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
                  {progressLoading ? "..." : completedCourses.length}
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
                  {resultsLoading ? "..." : myAttempts.length}
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
                    : (() => {
                      if (!myAttempts || myAttempts.length === 0) return 0;
                      const grouped: Record<string, number[]> = (myAttempts as any[]).reduce((acc: any, a: any) => {
                        const key = a.quiz?.id || `quiz-${a.id}`;
                        const pct = a.totalQuestions ? (a.score * 100) / a.totalQuestions : 0;
                        if (!acc[key]) acc[key] = [pct]; else acc[key].push(pct);
                        return acc;
                      }, {});
                      const bestPercents = Object.values(grouped).map((arr: number[]) => Math.round(Math.max(...arr)));
                      const avg = bestPercents.reduce((s, v) => s + v, 0) / bestPercents.length;
                      return Math.round(avg);
                    })()}
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
                <AvailableCourseCard key={course.id} course={course} participantId={username || ""} />
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
          {progressLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500/30 border-t-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departmentCourses.map((course) => (
                <CourseProgressCard key={course.id} course={course} participantId={username || ""} section="inProgress" />
              ))}
            </div>
          )}
        </section>

        {/* Completed Courses */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Completed Courses
          </h3>
          {progressLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/30 border-t-emerald-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departmentCourses.map((course) => (
                <CourseProgressCard key={course.id} course={course} participantId={username || ""} section="completed" />
              ))}
            </div>
          )}
        </section>

        {/* Assessment Results */}
        <section>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Assessment Results
          </h3>
          {myAttempts && myAttempts.length > 0 && (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-sky-200 dark:border-sky-500/20 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-sky-200 dark:border-sky-500/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Assessment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Best</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Attempts (percentages)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last Attempt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-200 dark:divide-sky-500/20">
                    {Object.values(
                      (myAttempts as any[]).reduce((acc: any, a: any) => {
                        const key = a.quiz?.id || `quiz-${a.id}`;
                        const pct = a.totalQuestions ? Math.round((a.score * 100) / a.totalQuestions) : 0;
                        if (!acc[key]) {
                          acc[key] = {
                            key,
                            name: a.quiz?.name || `Assessment #${a.quiz?.id || a.id}`,
                            list: [pct],
                            best: pct,
                            last: a.completedAt || null,
                          };
                        } else {
                          acc[key].list.push(pct);
                          acc[key].best = Math.max(acc[key].best, pct);
                          // last attempt = max completedAt, fallback to existing if nulls
                          const curr = acc[key].last ? new Date(acc[key].last).getTime() : 0;
                          const incoming = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                          if (incoming >= curr) acc[key].last = a.completedAt || acc[key].last;
                        }
                        return acc;
                      }, {})
                    ).map((row: any) => (
                      <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-800 dark:text-white">{row.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-800 dark:text-white">{row.best}%</td>
                        <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{row.list.map((p: number) => `${p}%`).join(', ')}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{row.last ? formatDateTime(row.last) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {resultsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/30 border-t-purple-500"></div>
            </div>
          ) : myAttempts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-500/20">
              <FileText className="mx-auto h-12 w-12 text-purple-500/30 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No assessment results yet. Complete an assessment to see your results here.
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
