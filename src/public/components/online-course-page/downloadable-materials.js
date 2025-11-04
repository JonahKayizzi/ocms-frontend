/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';
import { Download, FileText, Lock } from 'lucide-react';

export default function DownloadableMaterials({ materials, isEnrolled = false, onEnrollClick }) {
  const handleDownload = (material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  const handleDownloadAll = () => {
    materials.forEach((material) => {
      if (material.url) {
        setTimeout(() => {
          window.open(material.url, '_blank');
        }, 100);
      }
    });
  };
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
        {!isEnrolled ? (
          <div className="text-center py-6">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials Locked</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enroll in this course to access and download course materials.
            </p>
            {onEnrollClick && (
              <button
                type="button"
                onClick={onEnrollClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Enroll to Access Materials
              </button>
            )}
          </div>
        ) : materials.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No materials available for this course.</p>
        ) : (
          <>
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
                  onClick={() => handleDownload(material)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={`Download ${material.name}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
            </div>
            <div className="my-4 border-t border-gray-200" />
            <button
              type="button"
              onClick={handleDownloadAll}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download All Materials</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

DownloadableMaterials.propTypes = {
  materials: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      size: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  isEnrolled: PropTypes.bool,
  onEnrollClick: PropTypes.func,
};

DownloadableMaterials.defaultProps = {
  isEnrolled: false,
  onEnrollClick: null,
};
