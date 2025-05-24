import React from "react";
import { cn } from "@/lib/utils";

const ServiceCard = ({
  title,
  description,
  icon,
  className,
  actionLabel,
  onAction,
}) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center card-hover",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-urban-green-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-auto bg-urban-green-500 hover:bg-urban-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ServiceCard;