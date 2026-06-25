import React from "react";
import { DashboardLayout } from "../components/DashboardLayout.js";

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="stats-grid">
        <div className="card">
          <div className="card-title">Total Students</div>
          <div className="card-value">1,240</div>
        </div>
        <div className="card">
          <div className="card-title">Total Teachers</div>
          <div className="card-value">84</div>
        </div>
        <div className="card">
          <div className="card-title">Total Classes</div>
          <div className="card-value">32</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Fees</div>
          <div className="card-value">$8,450</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>System Administration notices</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Welcome to the administration panel. From here, you can assign roles, allocate student fees, manage sections, and schedule notice board items. Select an option from the sidebar to begin operations.
        </p>
      </div>
    </DashboardLayout>
  );
};
