import React from "react";
import { DashboardLayout } from "../components/DashboardLayout.js";

export const TeacherDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="stats-grid">
        <div className="card">
          <div className="card-title">My Assigned Classes</div>
          <div className="card-value">4</div>
        </div>
        <div className="card">
          <div className="card-title">My Students</div>
          <div className="card-value">120</div>
        </div>
        <div className="card">
          <div className="card-title">Today's Attendance</div>
          <div className="card-value">94%</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Grades</div>
          <div className="card-value">2 Exams</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Teacher Noticeboard</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Select "Mark Attendance" in the sidebar to record today's attendance sheets, or "Enter Exam Scores" to submit academic marks for subjects.
        </p>
      </div>
    </DashboardLayout>
  );
};
