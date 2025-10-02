'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Award,
} from 'lucide-react';
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useEditCourseMutation,
  useDeleteCourseMutation,
} from '../../../../redux/apiSlice';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const {
    data: fetchedCourses, isLoading, isError, error,
  } = useGetCoursesQuery();
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [editCourse, { isLoading: saving }] = useEditCourseMutation();
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (Array.isArray(fetchedCourses)) {
      const mapped = fetchedCourses.map((c) => ({
        id: c.id,
        title: c.name,
        subTitle: c.objectives || '',
        description: c.description || '',
        ICAO_certified: false,
        modules: Array.isArray(c.modules) ? c.modules.length : 0,
        lessons: Array.isArray(c.lessons) ? c.lessons.length : 0,
        status: 'Active',
        created: (c.createdAt || '').toString().slice(0, 10),
      }));
      setCourses(mapped);
    }
  }, [fetchedCourses]);

  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    description: '',
    ICAO_certified: false,
    status: 'Draft', // Added status to formData
  });

  const filteredCourses = courses.filter(
    (course) => course.title.toLowerCase().includes(searchTerm.toLowerCase())
      || course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await editCourse({
          courseId: editingCourse.id,
          updates: {
            name: formData.title,
            description: formData.description,
            objectives: formData.subTitle,
            learningGoals: '',
          },
        }).unwrap();
      } else {
        await createCourse({
          name: formData.title,
          description: formData.description,
          objectives: formData.subTitle,
          learningGoals: '',
        }).unwrap();
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({
        title: '',
        subTitle: '',
        description: '',
        ICAO_certified: false,
        status: 'Draft',
      });
    } catch (err) {
      const status = err?.status || err?.originalStatus;
      if (status === 401 || status === 403) {
        alert('You are not authorized to add/edit courses. Please sign in again.');
      } else if (status === 400) {
        alert(err?.data || 'Validation error while saving the course.');
      } else {
        alert('Failed to save course. Please try again.');
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      subTitle: course.subTitle,
      description: course.description,
      ICAO_certified: course.ICAO_certified,
      status: course.status, // Populate status when editing
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Course Management</h1>
        <button
          type="button"
          onClick={() => {
            setEditingCourse(null); // Ensure no course is being edited when adding new
            setFormData({
              title: '', subTitle: '', description: '', ICAO_certified: false, status: 'Draft',
            }); // Reset form data
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Course Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Content
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Status
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
              {isLoading && (
                <tr><td className="px-6 py-5 text-center text-gray-400" colSpan="5">Loading courses...</td></tr>
              )}
              {isError && (
                <tr>
                  <td className="px-6 py-5 text-center text-red-500" colSpan="5">
                    Failed to load courses
                    {error?.status ? ` (status ${error.status})` : ''}
                    .
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filteredCourses.map((course, index) => (
                <tr
                  key={course.id}
                  className={`
                    hover:bg-gray-700/70 transition-all duration-200 ease-in-out
                    ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}
                    group
                  `}
                >
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                          {course.title}
                        </div>
                        {course.ICAO_certified && (
                          <div className="flex items-center bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full text-xs font-medium border border-amber-700">
                            <Award className="h-3 w-3 mr-1" />
                            ICAO
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-300">{course.subTitle}</div>
                      <div className="text-xs text-gray-400 leading-relaxed max-w-md">{course.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-medium text-gray-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        {course.modules}
                        {' '}
                        Modules
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        {course.lessons}
                        {' '}
                        Lessons
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {(() => {
                      const statusStyles = {
                        Active: {
                          badgeClass:
          'bg-emerald-900/30 text-emerald-300 border-emerald-700',
                          dotClass: 'bg-emerald-500',
                        },
                        Draft: {
                          badgeClass:
          'bg-amber-900/30 text-amber-300 border-amber-700',
                          dotClass: 'bg-amber-500',
                        },
                        Archived: {
                          badgeClass:
          'bg-gray-700 text-gray-300 border-gray-600',
                          dotClass: 'bg-gray-500',
                        },
                      };
                      const st = statusStyles[course.status] || statusStyles.Draft;
                      return (
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${st.badgeClass}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${st.dotClass}`} />
                          {course.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-300">{course.created}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button type="button" onClick={() => handleEdit(course)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center space-x-1" disabled={saving || creating}>
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button type="button" onClick={() => handleDelete(course.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg flex items-center space-x-1" disabled={deleting}>
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                      <button type="button" className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs rounded-lg flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="title">Course Title</label>
                <input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="subTitle">Sub Title / Objectives</label>
                <input id="subTitle" value={formData.subTitle} onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })} className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="description">Description</label>
                <textarea id="description" rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100">Cancel</button>
                <button type="submit" disabled={creating || saving} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">{editingCourse ? (saving ? 'Saving...' : 'Save') : (creating ? 'Creating...' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
