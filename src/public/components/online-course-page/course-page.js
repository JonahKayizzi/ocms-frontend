'use client';

import { useParams } from 'react-router-dom';
import React, { useState, useMemo } from 'react';
// Import via absolute path within src to satisfy CRA restriction
import { useGetCourseByIdQuery, useGetModulesByCourseQuery, useGetLessonsByCourseQuery, useGetMaterialsByCourseQuery, useGetAssessmentsByCourseQuery } from '../../../redux/apiSlice';
import CourseHeader from './course-header';
import VideoSection from './video-section';
import CourseDescription from './course-description';
import CourseGoals from './course-goals';
import CourseOutline from './course-outline';
import AssessmentCard from './assessment-card';
import DownloadableMaterials from './downloadable-materials';
import ProgressCard from './progress-card';
import courseData from './data/course-data';

export default function CoursePage() {
  const { id } = useParams();
  const courseId = Number(id);

  const { data: course } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const { data: modules = [] } = useGetModulesByCourseQuery(courseId, { skip: !courseId });
  const { data: lessons = [] } = useGetLessonsByCourseQuery(courseId, { skip: !courseId });
  const { data: materials = [] } = useGetMaterialsByCourseQuery(courseId, { skip: !courseId });
  const { data: assessments = [] } = useGetAssessmentsByCourseQuery(courseId, { skip: !courseId });

  const title = course?.name || courseData.title;
  // Do not use dummy description as subtitle; keep header clean
  const subtitle = '';
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
  const progress = {
    currentLesson: currentLesson?.name || courseData.progress.currentLesson,
    currentLessonNumber: (lessons && lessons.length > 0 ? currentIndex + 1 : 1),
    totalLessons,
    completion: courseData.progress.completion,
    lessonsCompleted: courseData.progress.lessonsCompleted,
    lessonsRemaining: courseData.progress.lessonsRemaining,
  };
  const goPrev = () => setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  const goNext = () => setCurrentIndex((idx) => (idx < totalLessons - 1 ? idx + 1 : idx));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <CourseHeader
        title={title}
        subtitle={subtitle}
        duration={courseData.stats.duration}
        students={courseData.stats.students}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About this course first */}
            <CourseDescription description={course?.description || ''} />
            <CourseGoals goals={parsedGoals} />
            {/* Current lesson */}
            <VideoSection
              currentLesson={progress.currentLesson}
              currentLessonNumber={progress.currentLessonNumber}
              totalLessons={progress.totalLessons}
              loomVideoUrl={currentLesson?.loomVideoUrl || ''}
              contentHtml={currentLesson?.content || ''}
              onPrev={goPrev}
              onNext={goNext}
            />
            <CourseOutline modules={outlineModules} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AssessmentCard assessments={assessments} />
            <DownloadableMaterials materials={downloadableMaterials} />
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
