import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout.js";
import api from "../utils/api.js";

interface ClassItem {
  id: string;
  name: string;
  _count: {
    students: number;
  };
}

interface TeacherDashboardData {
  classCount: number;
  studentCount: number;
  attendancePercentage: number;
  classes: ClassItem[];
}

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await api.get("/teacher/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Failed to load teacher dashboard data:", err);
        setError("Could not load teacher dashboard. Check connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
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
          <div className="card-title">My Assigned Classes</div>
          <div className="card-value">{data.classCount}</div>
        </div>
        <div className="card">
          <div className="card-title">My Students</div>
          <div className="card-value">{data.studentCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Today's Attendance</div>
          <div className="card-value">{data.attendancePercentage}%</div>
        </div>
        <div className="card">
          <div className="card-title">Role Profile</div>
          <div className="card-value" style={{ fontSize: "1.2rem", paddingTop: "0.6rem" }}>
            Faculty Member
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>My Classrooms</h3>
        {data.classes.length === 0 ? (
          <div className="empty-state">
            <p>You have not been assigned as a class teacher or subject teacher for any class.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: "auto", border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Student Enrollment Count</th>
                  <th>Actions Quicklink</th>
                </tr>
              </thead>
              <tbody>
                {data.classes.map((cls) => (
                  <tr key={cls.id}>
                    <td style={{ fontWeight: 600 }}>{cls.name}</td>
                    <td>{cls._count.students} students enrolled</td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-brand)" }}>
                        Select attendance or grades in the sidebar to manage
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
