import React from 'react';

function Input({ label, icon, className, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-gray-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center">{icon}</div>}
        <input
          className={`w-full border border-gray-300 rounded-md py-2 px-4 ${icon ? 'pl-10' : ''} focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export default Input;