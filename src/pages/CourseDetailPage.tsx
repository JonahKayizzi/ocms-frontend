import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Users, Play, Download } from 'lucide-react';
import { useGetCourseByIdQuery, useGetLessonsByCourseQuery, useGetModulesByCourseQuery, useGetMaterialsByCourseQuery, useGetAssessmentsByCourseQuery } from '../redux/apiSlice';

const CourseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id!, 10);

    const { data: course, isLoading: courseLoading, error: courseError } = useGetCourseByIdQuery(courseId);
    const { data: lessons = [], isLoading: lessonsLoading } = useGetLessonsByCourseQuery(courseId);
    const { data: modules = [], isLoading: modulesLoading } = useGetModulesByCourseQuery(courseId);
    const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsByCourseQuery(courseId);
    const { data: assessments = [], isLoading: assessmentsLoading } = useGetAssessmentsByCourseQuery(courseId);

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0:
                return <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">Deactivated</span>;
            case 1:
                return <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Published</span>;
            case 2:
                return <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">Draft</span>;
            case 3:
                return <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">Completed</span>;
            default:
                return <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">Unknown</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (courseLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading course...</p>
                </div>
            </div>
        );
    }

    if (courseError || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-2">Course not found</div>
                    <Link to="/" className="text-blue-600 hover:text-blue-800">
                        Return to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Link to="/" className="mr-4 text-gray-600 hover:text-blue-600">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                            <div className="flex items-center mt-1">
                                {getStatusBadge(course.status)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Course Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Description</h2>
                            <p className="text-gray-600 mb-6">{course.description}</p>

                            {course.learningGoals && (
                                <div className="mb-6">
                                    <h3 className="text-md font-semibold text-gray-900 mb-2">Learning Goals</h3>
                                    <p className="text-gray-600">{course.learningGoals}</p>
                                </div>
                            )}

                            {course.objectives && (
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 mb-2">Objectives</h3>
                                    <p className="text-gray-600">{course.objectives}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Start Date</p>
                                        <p className="text-sm text-gray-600">
                                            {course.startDate ? formatDate(course.startDate) : 'TBD'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">End Date</p>
                                        <p className="text-sm text-gray-600">
                                            {course.endDate ? formatDate(course.endDate) : 'TBD'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Lessons</p>
                                        <p className="text-sm text-gray-600">{lessons.length} lessons</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Modules</p>
                                        <p className="text-sm text-gray-600">{modules.length} modules</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules and Lessons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Modules */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules</h2>
                        {modulesLoading ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-600">Loading modules...</p>
                            </div>
                        ) : modules.length === 0 ? (
                            <p className="text-gray-500 text-sm">No modules available for this course.</p>
                        ) : (
                            <div className="space-y-3">
                                {modules.map((module) => (
                                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900">{module.name}</h3>
                                        {module.description && (
                                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lessons */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lessons</h2>
                        {lessonsLoading ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-600">Loading lessons...</p>
                            </div>
                        ) : lessons.length === 0 ? (
                            <p className="text-gray-500 text-sm">No lessons available for this course.</p>
                        ) : (
                            <div className="space-y-3">
                                {lessons.map((lesson, index) => (
                                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Play className="h-4 w-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    Lesson {index + 1}: {lesson.name}
                                                </h3>
                                                {lesson.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                                                )}
                                                {lesson.loomVideoUrl && (
                                                    <p className="text-xs text-blue-600 mt-1">Video available</p>
                                                )}
                                                {lesson.content && (
                                                    <p className="text-xs text-green-600 mt-1">Content available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Materials and Assessments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Materials */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Materials</h2>
                        {materialsLoading ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-600">Loading materials...</p>
                            </div>
                        ) : materials.length === 0 ? (
                            <p className="text-gray-500 text-sm">No materials available for this course.</p>
                        ) : (
                            <div className="space-y-3">
                                {materials.map((m: any) => (
                                    <div key={m.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{m.name}</h3>
                                            {m.description && (
                                                <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                                            )}
                                        </div>
                                        <a
                                            href={`${(m.fileUrl || '').startsWith('http') ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8091')}${m.fileUrl || ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                        >
                                            <Download className="h-4 w-4 mr-1" /> Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assessments */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessments</h2>
                        {assessmentsLoading ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-600">Loading assessments...</p>
                            </div>
                        ) : assessments.length === 0 ? (
                            <p className="text-gray-500 text-sm">No assessments available for this course.</p>
                        ) : (
                            <ul className="space-y-3">
                                {assessments.map((a: any) => (
                                    <li key={a.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="font-medium text-gray-900">{a.name}</div>
                                        {a.description && (
                                            <div className="text-sm text-gray-600 mt-1">{a.description}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;


