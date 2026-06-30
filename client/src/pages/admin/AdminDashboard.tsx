import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GraduationCap, Users, Mail, FileText, IndianRupee, ArrowRight } from "lucide-react";

const API_URL = "http://localhost:9091/api";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingFees: number;
  recentNotices: {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    createdBy: {
      email: string;
    };
  }[];
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/admin/stats`, { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-glass-muted)" }}>
        <h3>Loading dashboard statistics...</h3>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-glass-muted)" }}>
        <h3>Failed to load dashboard data.</h3>
      </div>
    );
  }

  const formattedFees = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(stats.pendingFees);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* Console Title */}
      <div>
        <h2 style={{ color: "var(--text-canvas)", fontSize: "1.8rem", fontWeight: "700" }}>Admin Console</h2>
        <p style={{ color: "var(--text-canvas-muted, #7c7c82)", fontSize: "0.95rem", marginTop: "4px" }}>
          School analytics dashboard, registration indices, and bulletin activity
        </p>
      </div>

      {/* Grid statistics panel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", width: "100%" }}>
        
        {/* Total Students Card */}
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>STUDENTS</span>
            <GraduationCap size={18} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-glass)", margin: 0 }}>{stats.totalStudents}</h3>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Active Registrations</span>
        </div>

        {/* Faculties Card */}
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>FACULTIES</span>
            <Users size={18} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-glass)", margin: 0 }}>{stats.totalTeachers}</h3>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Approved Instructors</span>
        </div>

        {/* Total Classes Card */}
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>CLASSES</span>
            <FileText size={18} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-glass)", margin: 0 }}>{stats.totalClasses}</h3>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Academic Registers</span>
        </div>

        {/* Outstanding Fees Card */}
        <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>PENDING FEES</span>
            <IndianRupee size={18} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-glass)", margin: 0 }}>{formattedFees}</h3>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Outstanding Invoices</span>
        </div>

      </div>

      {/* Recent Activity Announcements Panel */}
      <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-glass)" }}>Recent Announcements Feed</h3>
            <p style={{ fontSize: "11px", color: "var(--text-glass-muted)", marginTop: "2px" }}>Broadcasting updates published by school administration</p>
          </div>
          <Link 
            to="/admin/notices" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              fontSize: "12px", 
              fontWeight: "700", 
              color: "var(--accent)", 
              textDecoration: "none" 
            }}
            className="sidebar-link-hover"
          >
            <span>View Board</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {stats.recentNotices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {stats.recentNotices.map((notice) => (
              <Link
                key={notice.id}
                to={`/admin/notices/${notice.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255, 255, 255, 0.01)",
                  textDecoration: "none",
                  color: "inherit",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
                className="sidebar-link-hover"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-glass)" }}>{notice.title}</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>
                    {new Date(notice.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "var(--text-glass-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {notice.message}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "var(--text-glass-muted)", marginTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Mail size={11} />
                    <span>{notice.createdBy.email}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-glass-muted)" }}>
            No announcements published yet.
          </div>
        )}
      </div>
    </div>
  );
};
