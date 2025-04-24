import React from 'react';

function Card({ children, className }) {
  return <div className={`bg-white rounded-lg p-6 ${className}`}>{children}</div>;
}

export default Card;