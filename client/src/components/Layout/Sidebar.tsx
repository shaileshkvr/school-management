import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, GraduationCap, Receipt, Bell, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeRole = user?.role;

  const getMenuItems = () => {
    switch (activeRole) {
      case "ADMIN":
        return [
          { label: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/admin" },
          { label: "Students", icon: <GraduationCap size={22} />, path: "/admin/students" },
          { label: "Teachers", icon: <Users size={22} />, path: "/admin/teachers" },
          { label: "Fees", icon: <Receipt size={22} />, path: "/admin/fees" },
          { label: "Notices", icon: <Bell size={22} />, path: "/admin/notices" },
        ];
      case "TEACHER":
        return [
          { label: "Overview", icon: <LayoutDashboard size={22} />, path: "/teacher" },
          { label: "Mark Attendance", icon: <Users size={22} />, path: "/teacher/attendance" },
          { label: "Submit Scores", icon: <BookOpen size={22} />, path: "/teacher/scores" },
        ];
      case "STUDENT":
        return [
          { label: "My Hub", icon: <LayoutDashboard size={22} />, path: "/student" },
          { label: "Attendance Log", icon: <Users size={22} />, path: "/student/attendance" },
          { label: "My Grades", icon: <BookOpen size={22} />, path: "/student/grades" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className="glass-panel"
      style={{
        width: isCollapsed ? "72px" : "260px",
        height: "calc(100vh - 32px)",
        margin: "16px 0 16px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.75rem 0.75rem",
        gap: "1.75rem",
        transition: "width 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        position: "sticky",
        top: "16px",
      }}
    >
      {/* Logo Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "0 12px" }}>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent)" }}>✦</span>
        {!isCollapsed && <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.01em" }}>EduPortal</span>}
      </div>

      {/* Navigation Links list */}
      <nav style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: "10px",
              color: "inherit",
              textDecoration: "none",
              gap: "14px",
              transition: "background-color 0.2s ease, transform 0.15s ease",
            }}
            className="sidebar-link-hover"
          >
            {item.icon}
            {!isCollapsed && <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse switch button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "inherit",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};
