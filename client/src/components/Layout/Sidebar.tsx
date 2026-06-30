import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, GraduationCap, Receipt, Bell, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const location = useLocation();

  const activeRole = user?.role;

  /**
   * Retrieves role-specific navigation menu items
   */
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
        padding: "1.5rem 0.75rem",
        gap: "1.75rem",
        transition: "width 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        position: "sticky",
        top: "16px",
      }}
    >
      {/* Brand Header with Collapsed Hover Morph Toggle */}
      {isCollapsed ? (
        /* Unified Collapsed Logo Trigger Box centered on axis */
        <button
          onClick={() => {
            setIsCollapsed(false);
            setIsLogoHovered(false); // Reset hover state
          }}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            background: isLogoHovered ? "rgba(255,255,255,0.08)" : "transparent",
            border: isLogoHovered ? "1px solid var(--glass-border)" : "1px solid transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: "inherit",
            padding: 0,
            margin: "0 auto"
          }}
          title="Expand Sidebar"
        >
          {isLogoHovered ? (
            <ChevronRight size={22} style={{ color: "var(--accent)" }} />
          ) : (
            <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent)" }}>✦</span>
          )}
        </button>
      ) : (
        /* Regular Expanded Brand Header Layout */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent)" }}>✦</span>
            <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.01em" }}>
              EduPortal
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(true)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
              color: "inherit",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      )}

      {/* Navigation Links List */}
      <nav style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        {menuItems.map((item, idx) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/admin" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={idx}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: isCollapsed ? "0" : "12px 16px",
                width: isCollapsed ? "44px" : "100%",
                height: isCollapsed ? "44px" : "auto",
                borderRadius: "10px",
                margin: isCollapsed ? "0 auto" : "0",
                textDecoration: "none",
                gap: isCollapsed ? "0" : "14px",
                transition: "background-color 0.2s ease, transform 0.15s ease, color 0.2s ease",
              }}
              className={`sidebar-link-hover ${isActive ? "sidebar-link-active" : ""}`}
            >
              <div
                style={{
                  display: "flex",
                  transition: "color 0.2s ease",
                }}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
