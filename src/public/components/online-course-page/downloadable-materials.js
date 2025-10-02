/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';
import { Download, FileText } from 'lucide-react';

export default function DownloadableMaterials({ materials }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-1">
          <Download className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Course Materials
          </h2>
        </div>
        <p className="text-gray-600">
          Download resources to enhance your learning
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {materials.map((material, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{material.name}</p>
                  <p className="text-xs text-gray-600">
                    {material.type}
                    {' '}
                    •
                    {material.size}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-gray-200" />
        <button type="button" className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          <Download className="h-4 w-4" />
          <span>Download All Materials</span>
        </button>
      </div>
    </div>
  );
}

DownloadableMaterials.propTypes = {
  materials: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
