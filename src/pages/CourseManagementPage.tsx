import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, ArrowLeft } from 'lucide-react';
import { useGetCoursesQuery } from '../redux/apiSlice';
import CourseForm from '../components/CourseForm';
import CourseCard from '../components/CourseCard';

const CourseManagementPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<number | null>(null);
    const { data: courses = [], isLoading, error } = useGetCoursesQuery();

    const handleCreateCourse = () => {
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleEditCourse = (courseId: number) => {
        setEditingCourse(courseId);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingCourse(null);
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0:
                return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Deactivated</span>;
            case 1:
                return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Published</span>;
            case 2:
                return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Draft</span>;
            case 3:
                return <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Completed</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Unknown</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (showForm) {
        return (
            <CourseForm
                courseId={editingCourse}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Link to="/" className="mr-4 text-gray-600 hover:text-blue-600">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <h1 className="ml-2 text-2xl font-bold text-gray-900">Course Management</h1>
                        </div>
                        <button
                            onClick={handleCreateCourse}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                                        <dd className="text-lg font-medium text-gray-900">{courses.length}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {courses.filter(c => c.status === 1).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {courses.filter(c => c.status === 2).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {courses.filter(c => c.status === 3).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">All Courses</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Manage your courses, modules, lessons, and assessments
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading courses...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 mb-2">Failed to load courses</div>
                            <p className="text-gray-500">Please try again later</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                            <div className="mt-6">
                                <button
                                    onClick={handleCreateCourse}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Course
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {courses.map((course) => (
                                <li key={course.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center">
                                                        <h4 className="text-lg font-medium text-gray-900">{course.name}</h4>
                                                        <div className="ml-3">
                                                            {getStatusBadge(course.status)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                                        <span>Created: {formatDate(course.createdAt)}</span>
                                                        {course.startDate && (
                                                            <>
                                                                <span className="mx-2">•</span>
                                                                <span>Start: {formatDate(course.startDate)}</span>
                                                            </>
                                                        )}
                                                        {course.endDate && (
                                                            <>
                                                                <span className="mx-2">•</span>
                                                                <span>End: {formatDate(course.endDate)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    to={`/course/${course.id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleEditCourse(course.id)}
                                                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CourseManagementPage;


