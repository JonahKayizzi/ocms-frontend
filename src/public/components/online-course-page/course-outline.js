/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CourseOutline({ modules }) {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Course Outline</h2>
        <p className="text-gray-600 mt-1">
          Expand each module to see detailed lesson breakdown
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.id}>
              <button
                type="button"
                onClick={() => toggleSection(module.id)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-3">
                  {openSections[module.id] ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {module.title || module.name}
                    </h3>
                    {module.duration && (
                      <p className="text-sm text-gray-600">{module.duration}</p>
                    )}
                  </div>
                </div>
              </button>
              {openSections[module.id] && (
                <div className="mt-2 ml-7">
                  <div className="space-y-2">
                    {module.lessons.map((lesson, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 py-1"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-gray-700">{typeof lesson === 'string' ? lesson : (lesson.title || lesson.name)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

CourseOutline.propTypes = {
  modules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired,
      lessons: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
};
