'use client';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useMemo } from 'react';
// Import via absolute path within src to satisfy CRA restriction
import { useGetCourseByIdQuery, useGetModulesByCourseQuery, useGetLessonsByCourseQuery, useGetMaterialsByCourseQuery, useGetAssessmentsByCourseQuery, useGetEnrollmentCountQuery, useIsEnrolledQuery, useEnrollMutation, useSetLessonCompletedMutation, useGetCourseProgressQuery, useGetUserQuizAttemptsQuery } from '../../../redux/apiSlice';
import { getToken, getUsernameFromToken, removeToken } from '../../../utils/jwtUtils';
import CourseHeader from './course-header';
import VideoSection from './video-section';
import CourseDescription from './course-description';
import CourseGoals from './course-goals';
import CourseOutline from './course-outline';
import AssessmentCard from './assessment-card';
import DownloadableMaterials from './downloadable-materials';
import ProgressCard from './progress-card';
import courseData from './data/course-data';
import LoginPage from '../../../pages/LoginPage';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = Number(id);
  const token = getToken();
  const usernameToken = token ? getUsernameFromToken(token) : null;
  const search = new URLSearchParams(location.search);
  // CRITICAL: If participantId is provided in URL, it should take precedence over token user
  const username = (search.get('participantId') || usernameToken || '').toString() || null;

  const { data: course } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const { data: modules = [] } = useGetModulesByCourseQuery(courseId, { skip: !courseId });
  const { data: lessons = [] } = useGetLessonsByCourseQuery(courseId, { skip: !courseId });
  const { data: materials = [] } = useGetMaterialsByCourseQuery(courseId, { skip: !courseId });
  const { data: assessments = [] } = useGetAssessmentsByCourseQuery(courseId, { skip: !courseId });
  const { data: enrollmentCountResp } = useGetEnrollmentCountQuery(courseId, { skip: !courseId });
  const { data: enrolledResp, refetch: refetchEnrollment } = useIsEnrolledQuery({ courseId, participantId: username || '' }, { skip: !courseId || !username });
  const { data: progressResp, refetch: refetchProgress } = useGetCourseProgressQuery({ courseId, participantId: username || '' }, { skip: !courseId || !username });
  const [enroll] = useEnrollMutation();
  const [setLessonCompleted] = useSetLessonCompletedMutation();
  const { data: userAttempts = [] } = useGetUserQuizAttemptsQuery(username || '', { skip: !username });

  const title = course?.name || courseData.title;
  // Do not use dummy description as subtitle; keep header clean
  const subtitle = '';
  // Duration from start/end dates
  const durationLabel = React.useMemo(() => {
    if (!course?.startDate || !course?.endDate) return '';
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    const diffMs = end - start;
    if (!Number.isFinite(diffMs) || diffMs <= 0) return '';
    const hours = Math.round(diffMs / 36e5);
    if (hours < 24) return `${hours} hours`;
    const days = Math.round(hours / 24);
    return `${days} days`;
  }, [course?.startDate, course?.endDate]);
  // Enrolled participants count
  const studentsLabel = React.useMemo(() => {
    const rawCount = (enrollmentCountResp?.count) || 0;
    const formatted = new Intl.NumberFormat().format(rawCount);
    return `${formatted} students`;
  }, [enrollmentCountResp]);
  // Split goals/objectives text by newlines and bullets to render as list
  const combinedGoalsText = (course?.learningGoals || course?.objectives || '').trim();
  const parsedGoals = combinedGoalsText
    ? combinedGoalsText
        .split(/\r?\n|•/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];
  const outlineModules = modules.length > 0 ? modules.map((m) => ({ id: m.id, title: m.name, lessons: lessons.filter((l) => l.module?.id === m.id).map((l) => ({ id: l.id, title: l.name })) })) : courseData.modules;
  const downloadableMaterials = materials.length > 0 ? materials.map((m) => ({ id: m.id, name: m.name, type: m.fileType || 'Document', url: `${(m.fileUrl || '').startsWith('http') ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8091')}${m.fileUrl || ''}` })) : courseData.materials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalLessons = lessons.length || courseData.progress.totalLessons;
  const currentLesson = useMemo(() => (lessons && lessons.length > 0 ? lessons[Math.min(Math.max(currentIndex, 0), lessons.length - 1)] : null), [lessons, currentIndex]);
  
  // Calculate real progress from API
  const completedLessons = progressResp?.completed || 0;
  const totalCourseLessons = progressResp?.total || totalLessons;
  const completionPercent = progressResp?.percent || 0;
  const remainingLessons = totalCourseLessons - completedLessons;
  
  const progress = {
    currentLesson: currentLesson?.name || courseData.progress.currentLesson,
    currentLessonNumber: (lessons && lessons.length > 0 ? currentIndex + 1 : 1),
    totalLessons,
    completion: Math.round(completionPercent),
    lessonsCompleted: completedLessons,
    lessonsRemaining: remainingLessons,
  };
  const goPrev = () => setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  const goNext = () => setCurrentIndex((idx) => (idx < totalLessons - 1 ? idx + 1 : idx));

  const isEnrolled = !!enrolledResp?.enrolled;
  const showContent = isEnrolled;
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleEnroll = async () => {
    try {
      console.log('Enrolling user:', { courseId, participantId: username });
      const result = await enroll({ courseId, participantId: username });
      console.log('Enrollment result:', result);
      await refetchEnrollment();
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <CourseHeader
        title={title}
        subtitle={subtitle}
        duration={durationLabel}
        students={studentsLabel}
        endDate={course?.endDate || ''}
        username={username}
        isEnrolled={isEnrolled}
        onEnrollClick={handleEnroll}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogout}
        onBackClick={() => navigate('/dashboard')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Login</h3>
                <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setShowLoginModal(false)}>✕</button>
              </div>
              <div className="p-4">
                <LoginPage 
                  onSuccess={async () => {
                    setShowLoginModal(false);
                    await refetchEnrollment();
                  }}
                />
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About this course first */}
            <CourseDescription description={course?.description || ''} />
            <CourseGoals goals={parsedGoals} />
            {/* Current lesson */}
            {showContent && (
              <VideoSection
                currentLesson={progress.currentLesson}
                currentLessonNumber={progress.currentLessonNumber}
                totalLessons={progress.totalLessons}
                loomVideoUrl={currentLesson?.loomVideoUrl || ''}
                contentHtml={currentLesson?.content || ''}
                onPrev={goPrev}
                onNext={goNext}
                // when user marks as completed
                onComplete={async () => {
                  if (!username || !currentLesson?.id) return;
                  await setLessonCompleted({ lessonId: currentLesson.id, participantId: username, completed: true });
                  // Refetch progress to update the progress card
                  await refetchProgress();
                }}
                disableComplete={progress.completion >= 100}
              />
            )}
            <CourseOutline modules={outlineModules} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AssessmentCard
              assessments={assessments}
              isEnrolled={isEnrolled}
              canTake={isEnrolled && progress.completion === 100}
            participantId={username || ''}
            attempts={userAttempts}
            />
            <DownloadableMaterials
              materials={downloadableMaterials}
              isEnrolled={isEnrolled}
              onEnrollClick={username ? handleEnroll : handleLoginClick}
            />
            <ProgressCard
              completion={progress.completion}
              lessonsCompleted={progress.lessonsCompleted}
              lessonsRemaining={progress.lessonsRemaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
