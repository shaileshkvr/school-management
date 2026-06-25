import React from "react";
import { useAuth } from "../context/AuthContext.js";
import { Link, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case "ADMIN":
        return [
          { path: "/admin", label: "Dashboard" },
          { path: "/admin/classes", label: "Manage Classes" },
          { path: "/admin/teachers", label: "Manage Teachers" },
          { path: "/admin/students", label: "Manage Students" },
          { path: "/admin/fees", label: "Fees Registry" },
          { path: "/admin/notices", label: "Post Announcements" },
        ];
      case "TEACHER":
        return [
          { path: "/teacher", label: "Dashboard" },
          { path: "/teacher/attendance", label: "Mark Attendance" },
          { path: "/teacher/grades", label: "Enter Exam Scores" },
          { path: "/teacher/notices", label: "Class Notice Board" },
        ];
      case "STUDENT":
        return [
          { path: "/student", label: "Dashboard" },
          { path: "/student/attendance", label: "My Attendance" },
          { path: "/student/grades", label: "My Grades" },
          { path: "/student/fees", label: "My Invoices" },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>🎓</span> SchoolManager
        </div>
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-primary" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h2>Overview</h2>
          <div className="header-user">
            <span className="role-badge">{user?.role}</span>
            <span>{user?.email}</span>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
};
