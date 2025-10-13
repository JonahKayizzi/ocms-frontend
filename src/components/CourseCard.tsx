import React from 'react';
import { BookOpen, Calendar, Users } from 'lucide-react';
import type { Course } from '../types';

interface CourseCardProps {
    course: Course;
    onEdit?: (courseId: number) => void;
    onDelete?: (courseId: number) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
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

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden course-card">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    </div>
                    {getStatusBadge(course.status)}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                    {course.startDate && (
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Start: {formatDate(course.startDate)}</span>
                        </div>
                    )}
                    {course.endDate && (
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>End: {formatDate(course.endDate)}</span>
                        </div>
                    )}
                </div>

                {(onEdit || onDelete) && (
                    <div className="mt-4 flex space-x-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(course.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(course.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCard;



