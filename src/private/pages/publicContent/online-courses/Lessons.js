'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, PlayCircle, Clock, Calendar,
} from 'lucide-react';

const Lessons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessons, setLessons] = useState([
    {
      id: 1,
      lesson_title: 'Introduction to Air Traffic Control',
      module_id: 1,
      module_name: 'Introduction to ATC',
      video_url: 'https://example.com/video1.mp4',
      lesson_duration: 45,
      lesson_checkpoint: 'Understanding basic ATC principles',
      order: 1,
      created: '2024-01-15',
    },
    {
      id: 2,
      lesson_title: 'Radio Communication Basics',
      module_id: 2,
      module_name: 'Communication Procedures',
      video_url: 'https://example.com/video2.mp4',
      lesson_duration: 30,
      lesson_checkpoint: 'Proper radio phraseology',
      order: 1,
      created: '2024-01-16',
    },
    {
      id: 3,
      lesson_title: 'GPS Fundamentals',
      module_id: 3,
      module_name: 'GPS Navigation',
      video_url: 'https://example.com/video3.mp4',
      lesson_duration: 60,
      lesson_checkpoint: 'GPS operation principles',
      order: 1,
      created: '2024-01-10',
    },
  ]);
  const [modules] = useState([
    { id: 1, module_title: 'Introduction to ATC' },
    { id: 2, module_title: 'Communication Procedures' },
    { id: 3, module_title: 'GPS Navigation' },
  ]);
  const [formData, setFormData] = useState({
    lesson_title: '',
    module_id: '',
    video_url: '',
    lesson_duration: '',
    lesson_checkpoint: '',
    order: 1,
  });
  const filteredLessons = lessons.filter(
    (lesson) => lesson.lesson_title.toLowerCase().includes(searchTerm.toLowerCase())
      || lesson.module_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedModule = modules.find((m) => m.id === Number.parseInt(formData.module_id, 10));
    if (editingLesson) {
      setLessons(
        lessons.map((lesson) => (lesson.id === editingLesson.id
          ? {
            ...lesson,
            ...formData,
            module_id: Number.parseInt(formData.module_id, 10),
            lesson_duration: Number.parseInt(formData.lesson_duration, 10),
            module_name: selectedModule?.module_title || '',
          }
          : lesson)),
      );
    } else {
      const newLesson = {
        id: Date.now(),
        ...formData,
        module_id: Number.parseInt(formData.module_id, 10),
        lesson_duration: Number.parseInt(formData.lesson_duration, 10),
        module_name: selectedModule?.module_title || '',
        created: new Date().toISOString().split('T')[0],
      };
      setLessons([...lessons, newLesson]);
    }
    setShowModal(false);
    setEditingLesson(null);
    setFormData({
      lesson_title: '',
      module_id: '',
      video_url: '',
      lesson_duration: '',
      lesson_checkpoint: '',
      order: 1,
    });
  };
  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      lesson_title: lesson.lesson_title,
      module_id: lesson.module_id.toString(),
      video_url: lesson.video_url,
      lesson_duration: lesson.lesson_duration.toString(),
      lesson_checkpoint: lesson.lesson_checkpoint,
      order: lesson.order,
    });
    setShowModal(true);
  };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      setLessons(lessons.filter((lesson) => lesson.id !== id));
    }
  };
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Lesson Management</h1>
        <button
          type="button"
          onClick={() => {
            setEditingLesson(null); // Ensure no lesson is being edited when adding new
            setFormData({
              lesson_title: '',
              module_id: '',
              video_url: '',
              lesson_duration: '',
              lesson_checkpoint: '',
              order: 1,
            }); // Reset form data
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Lesson</span>
        </button>
      </div>
      {/* Search */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* Lessons Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Lesson
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Module
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Checkpoint
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
              {filteredLessons.map((lesson, index) => (
                <tr
                  key={lesson.id}
                  className={`
                    hover:bg-gray-700/70 transition-all duration-200 ease-in-out
                    ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}
                    group
                  `}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <PlayCircle className="h-5 w-5 text-blue-400 mr-3" />
                      <div>
                        <div className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                          {lesson.lesson_title}
                        </div>
                        <div className="text-xs text-gray-400">
                          Order:
                          {lesson.order}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-300">{lesson.module_name}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDuration(lesson.lesson_duration)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-300 max-w-xs truncate">{lesson.lesson_checkpoint}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm text-gray-400 font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(lesson.created).toLocaleDateString('en-US', {
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
                        onClick={() => handleEdit(lesson)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-all duration-200 group/btn"
                      >
                        <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(lesson.id)}
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
          <div className="bg-gray-800 text-gray-100 rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Lesson Title</span>
                <input
                  type="text"
                  value={formData.lesson_title}
                  onChange={(e) => setFormData({ ...formData, lesson_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Module</span>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.module_title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Video URL</span>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.lesson_duration}
                    onChange={(e) => setFormData({ ...formData, lesson_duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Order</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData(
                      { ...formData, order: Number.parseInt(e.target.value, 10) },
                    )}
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Lesson Checkpoint</span>
                <textarea
                  value={formData.lesson_checkpoint}
                  onChange={(e) => setFormData({ ...formData, lesson_checkpoint: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What should students achieve after this lesson?"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLesson(null);
                    setFormData({
                      lesson_title: '',
                      module_id: '',
                      video_url: '',
                      lesson_duration: '',
                      lesson_checkpoint: '',
                      order: 1,
                    });
                  }}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingLesson ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Lessons;
