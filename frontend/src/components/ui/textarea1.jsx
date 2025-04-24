import React from 'react';

function TextArea({ label, className, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-gray-700">{label}</label>}
      <textarea
        className={`w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        {...props}
      />
    </div>
  );
}

export default TextArea;