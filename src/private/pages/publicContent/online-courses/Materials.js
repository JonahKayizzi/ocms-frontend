'use client';

import { useState } from 'react';
import {
  Plus, Edit, Trash2, Download, Upload, Calendar,
} from 'lucide-react';

const MaterialManagement = () => {
  const [materials] = useState([
    {
      id: '1',
      name: 'SMS Manual.pdf',
      type: 'PDF',
      size: '3.2 MB',
      category: 'manual',
      courseTitle: 'Aviation SMS Course',
      downloads: 1247,
      uploadedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'ICAO Doc 9859.pdf',
      type: 'PDF',
      size: '6.8 MB',
      category: 'regulation',
      courseTitle: 'Aviation SMS Course',
      downloads: 892,
      uploadedAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'Hazard Reporting Form.docx',
      type: 'DOCX',
      size: '0.5 MB',
      category: 'form',
      courseTitle: 'Aviation SMS Course',
      downloads: 567,
      uploadedAt: '2024-01-08',
    },
  ]);
  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'DOCX':
        return '📝';
      case 'XLSX':
        return '📊';
      default:
        return '📁';
    }
  };
  const getCategoryColor = (category) => {
    switch (category) {
      case 'manual':
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case 'regulation':
        return 'bg-red-900/30 text-red-300 border-red-700';
      case 'form':
        return 'bg-green-900/30 text-green-300 border-green-700';
      case 'checklist':
        return 'bg-purple-900/30 text-purple-300 border-purple-700';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Material Management</h1>
          <p className="text-gray-300 mt-1">Upload and manage course materials and resources</p>
        </div>
        <button type="button" className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Upload Material</span>
        </button>
      </div>
      {/* Upload Area */}
      <div className="bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-700 p-8">
        <div className="text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">Upload Course Materials</h3>
          <p className="text-gray-300 mb-4">Drag and drop files here, or click to browse</p>
          <button type="button" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Choose Files
          </button>
          <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, DOC, XLS, PPT, ZIP (Max: 50MB per file)</p>
        </div>
      </div>
      {/* Materials List */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {materials.map((material, index) => (
                <tr
                  key={material.id}
                  className={`
                    hover:bg-gray-700/70 transition-all duration-200 ease-in-out
                    ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}
                    group
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(material.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-100">{material.name}</div>
                        <div className="text-sm text-gray-400">
                          {material.type}
                          {' '}
                          •
                          {material.size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(
                        material.category,
                      )}`}
                    >
                      {material.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{material.courseTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{material.downloads.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-400 font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {new Date(material.uploadedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <button type="button" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-all duration-200 group/btn">
                        <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button type="button" className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-all duration-200 group/btn">
                        <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button type="button" className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 group/btn">
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
    </div>
  );
};
export default MaterialManagement;
