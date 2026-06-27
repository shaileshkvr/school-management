import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout.js";
import api from "../utils/api.js";

interface Notice {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  createdBy: {
    email: string;
  };
}

interface StatsData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingFees: string | number;
  recentNotices: Notice[];
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        setError("Could not load stats data. Please check connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="empty-state">
          <h3>Loading dashboard data...</h3>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="alert alert-danger" style={{ margin: "2rem" }}>
          {error || "An unexpected error occurred."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        <div className="card">
          <div className="card-title">Total Students</div>
          <div className="card-value">{stats.totalStudents}</div>
        </div>
        <div className="card">
          <div className="card-title">Total Teachers</div>
          <div className="card-value">{stats.totalTeachers}</div>
        </div>
        <div className="card">
          <div className="card-title">Total Classes</div>
          <div className="card-value">{stats.totalClasses}</div>
        </div>
        <div className="card">
          <div className="card-title">Pending Fees</div>
          <div className="card-value">
            ₹{parseFloat(stats.pendingFees.toString()).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>System Announcements</h3>
        
        {stats.recentNotices.length === 0 ? (
          <div className="empty-state">
            <p>No recent announcements found.</p>
          </div>
        ) : (
          <div className="notice-list">
            {stats.recentNotices.map((notice) => (
              <div key={notice.id} className="notice-item">
                <h4 style={{ fontWeight: 600, color: "var(--text-primary)" }}>{notice.title}</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  {notice.message}
                </p>
                <div className="notice-meta" style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
                  <span>Posted by: {notice.createdBy.email}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
