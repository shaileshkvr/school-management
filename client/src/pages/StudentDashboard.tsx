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

interface StudentDashboardData {
  attendanceRate: number;
  completedExams: number;
  averageScore: number;
  outstandingFees: number;
  recentNotices: Notice[];
}

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/student/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
        setError("Could not load student dashboard. Check connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
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

  if (error || !data) {
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
          <div className="card-title">My Attendance Rate</div>
          <div className="card-value">{data.attendanceRate}%</div>
        </div>
        <div className="card">
          <div className="card-title">Completed Exams</div>
          <div className="card-value">{data.completedExams}</div>
        </div>
        <div className="card">
          <div className="card-title">Average Score</div>
          <div className="card-value">{data.averageScore}%</div>
        </div>
        <div className="card">
          <div className="card-title">Outstanding Fees</div>
          <div className="card-value">
            {data.outstandingFees === 0 ? "Fully Paid" : `${data.outstandingFees} Unpaid`}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>My Class Board & Notice Board</h3>
        
        {data.recentNotices.length === 0 ? (
          <div className="empty-state">
            <p>No recent announcements for your class.</p>
          </div>
        ) : (
          <div className="notice-list">
            {data.recentNotices.map((notice) => (
              <div key={notice.id} className="notice-item">
                <h4 style={{ fontWeight: 600, color: "var(--text-primary)" }}>{notice.title}</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  {notice.message}
                </p>
                <div className="notice-meta" style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
                  <span>Posted by: {notice.createdBy.email}</span>
                  <span>
                    {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
