import React from 'react';

function Button({ children, variant = 'primary', fullWidth, icon, className, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium';
  const variantStyles =
    variant === 'primary'
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseStyles} ${variantStyles} ${widthStyle} ${className}`} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;