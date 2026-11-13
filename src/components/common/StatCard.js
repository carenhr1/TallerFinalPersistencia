import React from 'react';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bgColor, color: color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
