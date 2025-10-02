import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({
  label, name, value, onChange,
}) => {
  const toolbarOptions = [['bold', 'italic', 'underline', 'image'], // toggled buttons
    ['blockquote', 'code-block'],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    [{ direction: 'rtl' }], // text direction

    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ['clean']];

  const module = {
    toolbar: toolbarOptions,
  };
  return (
    <div className="flex flex-wrap mx-3 w-full">
      <div className="flex flex-col w-full px-3 lg:mb-6">
        <label
          htmlFor={name}
          className="text-gray-400 text-sm mb-2"
        >
          {label}
          <span className="text-red-500">*</span>
        </label>

        <ReactQuill
          className="border-2 border-gray-500 bg-gray-300 rounded-md text-sm h-80 text-gray-500 leading-tight focus:outline-none focus:bg-white overflow-y-auto p-2"
          modules={module}
          theme="snow"
          id="postContent"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;

RichTextEditor.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
