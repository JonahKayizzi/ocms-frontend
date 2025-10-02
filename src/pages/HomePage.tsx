import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import { useGetPublishedCoursesQuery, useGetCompletedCoursesQuery } from '../redux/apiSlice';

const HomePage: React.FC = () => {
    const { data: publishedCourses = [], isLoading: publishedLoading } = useGetPublishedCoursesQuery();
    const { data: completedCourses = [], isLoading: completedLoading } = useGetCompletedCoursesQuery();

    const getStatusBadge = (status: number) => {
        switch (status) {
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
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <h1 className="ml-2 text-2xl font-bold text-gray-900">OCMS</h1>
                        </div>
                        <nav className="flex space-x-8">
                            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                                Home
                            </Link>
                            <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                                Admin
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-4">Online Courses & Assessments</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Discover our comprehensive collection of courses designed to enhance your skills and knowledge.
                    </p>
                    <Link
                        to="/admin"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Manage Courses
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Published Courses Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Available Courses</h3>
                        <p className="text-lg text-gray-600">Explore our published courses</p>
                    </div>

                    {publishedLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading courses...</p>
                        </div>
                    ) : publishedCourses.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No published courses</h3>
                            <p className="mt-1 text-sm text-gray-500">Check back later for new courses.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publishedCourses.map((course) => (
                                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden course-card">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900">{course.name}</h4>
                                            {getStatusBadge(course.status)}
                                        </div>
                                        <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>Start: {course.startDate ? formatDate(course.startDate) : 'TBD'}</span>
                                            <span>End: {course.endDate ? formatDate(course.endDate) : 'TBD'}</span>
                                        </div>
                                        <div className="mt-4">
                                            <Link
                                                to={`/course/${course.id}`}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View Course
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Completed Courses Section */}
            {completedCourses.length > 0 && (
                <section className="py-16 bg-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Completed Courses</h3>
                            <p className="text-lg text-gray-600">Courses that have finished</p>
                        </div>

                        {completedLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">Loading completed courses...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {completedCourses.map((course) => (
                                    <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden course-card">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">{course.name}</h4>
                                                {getStatusBadge(course.status)}
                                            </div>
                                            <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>Start: {course.startDate ? formatDate(course.startDate) : 'TBD'}</span>
                                                <span>End: {course.endDate ? formatDate(course.endDate) : 'TBD'}</span>
                                            </div>
                                            <div className="mt-4">
                                                <Link
                                                    to={`/course/${course.id}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View Course
                                                    <ArrowRight className="ml-1 h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-blue-400" />
                            <h3 className="ml-2 text-2xl font-bold">OCMS</h3>
                        </div>
                        <p className="text-gray-400">Online Courses & Assessments Management System</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;


