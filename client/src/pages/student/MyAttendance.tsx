import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export const MyAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await api.get("/student/attendance");
        setRecords(response.data);
      } catch (err) {
        console.error("Failed to load my attendance history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  const getStats = () => {
    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, percentage };
  };

  const stats = getStats();

  return (
    <DashboardLayout title="My Attendance">
      <div className="page-header">
        <h3>My Attendance Ledger</h3>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Retrieving attendance logs...</h3>
        </div>
      ) : (
        <div>
          <div className="summary-bar">
            <div className="summary-item">
              <span className="label">Total Academic Days</span>
              <span className="value">{stats.total} days</span>
            </div>
            <div className="summary-item">
              <span className="label">Days Present</span>
              <span className="value" style={{ color: "var(--color-success)" }}>
                {stats.present} days
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Days Absent</span>
              <span className="value" style={{ color: "var(--color-danger)" }}>
                {stats.absent} days
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Days Late</span>
              <span className="value" style={{ color: "var(--color-warning)" }}>
                {stats.late} days
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Attendance Ratio</span>
              <span className="value" style={{ color: "var(--color-brand)" }}>
                {stats.percentage}%
              </span>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              <p>No attendance logs registered for your profile yet.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Attendance Status Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(r.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`status-badge ${r.status.toLowerCase()}`}>
                          {r.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};
