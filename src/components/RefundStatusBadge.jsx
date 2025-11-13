import React from "react";

const statusColors = {
  PROCESSED: "bg-green-100 text-green-700 border-green-400",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-400",
  FAILED: "bg-red-100 text-red-700 border-red-400",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-400",
};

const RefundStatusBadge = ({ status }) => {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}
    >
      {status}
    </span>
  );
};

export default RefundStatusBadge;
