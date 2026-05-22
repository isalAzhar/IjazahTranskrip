// src/components/ui/StatCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const StatCard = ({ 
  title, 
  value, 
  sub, 
  subColor, 
  icon, 
  linkTo, 
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (linkTo) {
      navigate(linkTo);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full cursor-pointer hover:shadow-md transition-all duration-300"
    >
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">{title}</p>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">
            {typeof value === 'number' ? value?.toLocaleString("id-ID") : value || "0"}
          </h2>
          <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 bg-white shadow-sm">
            {icon}
          </div>
        </div>
      </div>
      {sub && (
        <p className={`text-[11px] mt-4 font-medium ${subColor || "text-gray-400"}`}>
          {sub}
        </p>
      )}
    </div>
  );
};

export default StatCard;