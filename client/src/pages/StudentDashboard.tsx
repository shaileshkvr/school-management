import React from "react";
import { DashboardLayout } from "../components/DashboardLayout.js";

export const StudentDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="stats-grid">
        <div className="card">
          <div className="card-title">My Attendance Rate</div>
          <div className="card-value">96.8%</div>
        </div>
        <div className="card">
          <div className="card-title">Completed Exams</div>
          <div className="card-value">6</div>
        </div>
        <div className="card">
          <div className="card-title">Average Score</div>
          <div className="card-value">85.4%</div>
        </div>
        <div className="card">
          <div className="card-title">Outstanding Fees</div>
          <div className="card-value">1 Invoice</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Student notice board</h3>
        <div className="notice-list">
          <div className="notice-item">
            <h4>Science Lab practicals reschedule</h4>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              The practical exam scheduled for Friday has been moved to Monday due to renovations.
            </p>
            <div className="notice-meta">
              <span>By: Admin</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
