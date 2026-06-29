import React from "react";

export const StudentDashboard: React.FC = () => {
  return (
    <div>
      <h2>Student Portal Overview</h2>
      <p>Grades and Attendance details</p>
      <div className="glass-panel" style={{ padding: "2rem", marginTop: "1rem" }}>
        <h3>My Attendance Index</h3>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)" }}>94.2%</p>
      </div>
    </div>
  );
};
