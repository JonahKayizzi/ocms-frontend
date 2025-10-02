import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useCreateCourseMutation, useUpdateCourseMutation, useGetCourseByIdQuery } from '../redux/apiSlice';
import type { CourseFormData, CoursePayload } from '../types';

interface CourseFormProps {
    courseId?: number | null;
    onClose: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ courseId, onClose }) => {
    const [formData, setFormData] = useState<CourseFormData>({
        name: '',
        description: '',
        learningGoals: '',
        objectives: '',
        startDate: '',
        endDate: '',
    });

    const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
    const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
    const { data: existingCourse, isLoading: isLoadingCourse } = useGetCourseByIdQuery(courseId!, {
        skip: !courseId,
    });

    useEffect(() => {
        if (existingCourse) {
            setFormData({
                name: existingCourse.name,
                description: existingCourse.description,
                learningGoals: existingCourse.learningGoals,
                objectives: existingCourse.objectives,
                startDate: existingCourse.startDate ? new Date(existingCourse.startDate).toISOString().slice(0, 16) : '',
                endDate: existingCourse.endDate ? new Date(existingCourse.endDate).toISOString().slice(0, 16) : '',
            });
        }
    }, [existingCourse]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const normalizeDate = (dateStr: string): string | null => {
        if (!dateStr) return null;
        return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const submitData: CoursePayload = {
                ...formData,
                startDate: normalizeDate(formData.startDate),
                endDate: normalizeDate(formData.endDate),
            };

            if (courseId) {
                await updateCourse({ id: courseId, updates: submitData }).unwrap();
            } else {
                await createCourse(submitData).unwrap();
            }

            onClose();
        } catch (error) {
            console.error('Failed to save course:', error);
            // You could add a toast notification here
        }
    };

    const isLoading = isCreating || isUpdating || isLoadingCourse;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {courseId ? 'Edit Course' : 'Create New Course'}
                        </h1>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Course Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Course Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter course name"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter course description"
                                />
                            </div>

                            {/* Learning Goals */}
                            <div>
                                <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700">
                                    Learning Goals
                                </label>
                                <textarea
                                    name="learningGoals"
                                    id="learningGoals"
                                    rows={3}
                                    value={formData.learningGoals}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="What will students learn from this course?"
                                />
                            </div>

                            {/* Objectives */}
                            <div>
                                <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
                                    Objectives
                                </label>
                                <textarea
                                    name="objectives"
                                    id="objectives"
                                    rows={3}
                                    value={formData.objectives}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="What are the specific objectives of this course?"
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    id="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                    End Date
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    id="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {courseId ? 'Update Course' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseForm;
