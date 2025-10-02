'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, BookOpen, Calendar,
} from 'lucide-react';

const Modules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [modules, setModules] = useState([
    {
      id: 1,
      module_title: 'Introduction to ATC',
      course_id: 1,
      course_name: 'Air Traffic Control Fundamentals',
      lessons: 6,
      created: '2024-01-15',
    },
    {
      id: 2,
      module_title: 'Communication Procedures',
      course_id: 1,
      course_name: 'Air Traffic Control Fundamentals',
      lessons: 4,
      created: '2024-01-16',
    },
    {
      id: 3,
      module_title: 'GPS Navigation',
      course_id: 2,
      course_name: 'Navigation Systems',
      lessons: 5,
      created: '2024-01-10',
    },
  ]);
  const [courses] = useState([
    { id: 1, title: 'Air Traffic Control Fundamentals' },
    { id: 2, title: 'Navigation Systems' },
    { id: 3, title: 'Weather Analysis' },
  ]);
  const [formData, setFormData] = useState({
    module_title: '',
    course_id: '',
  });
  const filteredModules = modules.filter(
    (module) => module.module_title.toLowerCase().includes(searchTerm.toLowerCase())
      || module.course_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCourse = courses.find((c) => c.id === Number.parseInt(formData.course_id, 10));
    if (editingModule) {
      setModules(
        modules.map((module) => (module.id === editingModule.id
          ? {
            ...module,
            ...formData,
            course_id: Number.parseInt(formData.course_id, 10),
            course_name: selectedCourse?.title || '',
          }
          : module)),
      );
    } else {
      const newModule = {
        id: Date.now(),
        ...formData,
        course_id: Number.parseInt(formData.course_id, 10),
        course_name: selectedCourse?.title || '',
        lessons: 0,
        created: new Date().toISOString().split('T')[0],
      };
      setModules([...modules, newModule]);
    }
    setShowModal(false);
    setEditingModule(null);
    setFormData({ module_title: '', course_id: '', order: 1 });
  };
  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({
      module_title: module.module_title,
      course_id: module.course_id.toString(),
      order: module.order,
    });
    setShowModal(true);
  };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setModules(modules.filter((module) => module.id !== id));
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Module Management</h1>
        <button
          type="button"
          onClick={() => {
            setEditingModule(null); // Ensure no module is being edited when adding new
            setFormData({ module_title: '', course_id: '', order: 1 }); // Reset form data
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Module</span>
        </button>
      </div>
      {/* Search */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* Modules Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Module
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Lessons
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredModules.map((module, index) => (
                <tr
                  key={module.id}
                  className={`
                    hover:bg-gray-700/70 transition-all duration-200 ease-in-out
                    ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}
                    group
                  `}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                      <div className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                        {module.module_title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-300">{module.course_name}</td>
                  <td className="px-6 py-5 text-sm text-gray-300">{module.lessons}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm text-gray-400 font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(module.created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(module)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-all duration-200 group/btn"
                      >
                        <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(module.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 group/btn"
                      >
                        <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-gray-100 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Module Title</span>
                <input
                  type="text"
                  value={formData.module_title}
                  onChange={(e) => setFormData({ ...formData, module_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Course</span>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingModule(null);
                    setFormData({ module_title: '', course_id: '', order: 1 });
                  }}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingModule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Modules;
