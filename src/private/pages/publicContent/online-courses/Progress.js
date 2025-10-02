'use client';

import { useState } from 'react';
import {
  Search, User, BookOpen, CheckCircle, Clock, TrendingUp,
} from 'lucide-react';

const Progress = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [progressData, setProgressData] = useState([

    {
      id: 1,
      employee_name: 'John Smith',
      course_title: 'Air Traffic Control Fundamentals',
      lesson_title: 'Introduction to ATC',
      lesson_checkpoint: 'Understanding basic ATC principles',
      lesson_checkpoint_flag: true,
      progress_percentage: 75,
      last_accessed: '2024-01-20',
      status: 'In Progress',
    },
    {
      id: 2,
      employee_name: 'Sarah Johnson',
      course_title: 'Navigation Systems',
      lesson_title: 'GPS Fundamentals',
      lesson_checkpoint: 'GPS operation principles',
      lesson_checkpoint_flag: true,
      progress_percentage: 100,
      last_accessed: '2024-01-19',
      status: 'Completed',
    },
    {
      id: 3,
      employee_name: 'Michael Brown',
      course_title: 'Air Traffic Control Fundamentals',
      lesson_title: 'Communication Procedures',
      lesson_checkpoint: 'Proper radio phraseology',
      lesson_checkpoint_flag: false,
      progress_percentage: 45,
      last_accessed: '2024-01-18',
      status: 'In Progress',
    },
    {
      id: 4,
      employee_name: 'John Smith',
      course_title: 'Weather Analysis',
      lesson_title: 'Weather Patterns',
      lesson_checkpoint: 'Understanding weather systems',
      lesson_checkpoint_flag: false,
      progress_percentage: 20,
      last_accessed: '2024-01-17',
      status: 'Started',
    },
  ]);
  console.log(setProgressData);
  const courses = ['Air Traffic Control Fundamentals', 'Navigation Systems', 'Weather Analysis'];
  const statuses = ['Started', 'In Progress', 'Completed'];

  const filteredProgress = progressData.filter((progress) => {
    const matchesSearch = progress.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      || progress.course_title.toLowerCase().includes(searchTerm.toLowerCase())
      || progress.lesson_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = filterCourse === '' || progress.course_title === filterCourse;
    const matchesStatus = filterStatus === '' || progress.status === filterStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Started':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate summary stats
  const totalEmployees = new Set(progressData.map((p) => p.employee_name)).size;
  const completedLessons = progressData.filter((p) => p.lesson_checkpoint_flag).length;
  const averageProgress = Math.round(
    progressData.reduce((sum, p) => sum + p.progress_percentage, 0) / progressData.length,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Checkpoints</p>
              <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageProgress}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-lg p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{progressData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search progress..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course & Lesson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Checkpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Accessed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProgress.map((progress) => (
                <tr key={progress.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {progress.employee_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{progress.employee_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{progress.course_title}</div>
                      <div className="text-sm text-gray-500">{progress.lesson_title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">
                            {progress.progress_percentage}
                            %
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(progress.progress_percentage)}`}
                            style={{ width: `${progress.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {progress.lesson_checkpoint_flag ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <div className="text-sm text-gray-900 max-w-xs truncate">{progress.lesson_checkpoint}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(progress.status)}`}
                    >
                      {progress.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{progress.last_accessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Progress;
