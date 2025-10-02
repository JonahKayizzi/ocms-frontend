/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';

export default function CourseDescription({ description }) {
  const paragraphs = Array.isArray(description)
    ? description
    : (typeof description === 'string' && description.trim().length > 0
      ? description.split(/\r?\n/).filter((p) => p.trim().length > 0)
      : []);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          About This Course
        </h2>
      </div>
      <div className="p-6">
        <div className="prose max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-gray-700 leading-relaxed mt-4 first:mt-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
CourseDescription.propTypes = {
  description: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]).isRequired,
};
