// src/components/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 transition-transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;