import React from "react";

export const TeacherDashboard: React.FC = () => {
  return (
    <div>
      <h2>Teacher Overview Canvas</h2>
      <p>Classrooms and Attendance Submissions</p>
      <div className="glass-panel" style={{ padding: "2rem", marginTop: "1rem" }}>
        <h3>Scheduled Classes</h3>
        <p>Mathematics II (A) - 09:30 AM</p>
      </div>
    </div>
  );
};
