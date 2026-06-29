import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Search, SlidersHorizontal, LogOut, Settings, User, Check } from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    class: false,
    subject: false,
    status: false,
  });

  const filterRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (key: 'class' | 'subject' | 'status') => {
    setSelectedFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return { bg: "rgba(234, 88, 12, 0.15)", text: "#ea580c" };
      case "TEACHER":
        return { bg: "rgba(202, 138, 4, 0.15)", text: "#ca8a04" };
      default:
        return { bg: "rgba(37, 99, 235, 0.15)", text: "#2563eb" };
    }
  };

  const badge = getRoleBadgeStyle(user?.role);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.25rem",
        gap: "1.5rem",
      }}
    >
      {/* Advanced Search & Filter Popover */}
      <div style={{ position: "relative", flex: 1, maxWidth: "520px", display: "flex", gap: "10px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-glass-muted)" }} size={18} />
          <input
            type="text"
            placeholder="Search students, classes, records..."
            className="glass-panel glass-input"
            style={{
              width: "100%",
              paddingLeft: "42px",
              fontSize: "14px",
              height: "42px",
              borderRadius: "10px",
              background: "var(--glass-bg)",
              color: "var(--text-glass)",
              border: "1px solid var(--glass-border)",
            }}
          />
        </div>
        
        <div ref={filterRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="glass-panel"
            style={{
              padding: "0 16px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--glass-bg)",
              color: "var(--text-glass)",
              border: "1px solid var(--glass-border)",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
            }}
          >
            <SlidersHorizontal size={15} />
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Filter</span>
          </button>

          {/* Premium Glass Popover Filter List */}
          {showFilters && (
            <div
              className="glass-panel"
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                width: "280px",
                padding: "16px",
                zIndex: 200,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "var(--glass-bg)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--glass-shadow)",
                color: "var(--text-glass)",
                borderRadius: "16px",
              }}
            >
              <div style={{ fontWeight: "700", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Filter Resources
              </div>

              {/* Custom Checkbox Row - Class */}
              <div
                onClick={() => toggleFilter('class')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: selectedFilters.class ? "rgba(234, 88, 12, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid",
                  borderColor: selectedFilters.class ? "var(--accent)" : "var(--glass-border)",
                  cursor: "pointer",
                  transition: "all 0.2s var(--transition-smooth)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Filter by Class</span>
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "6px",
                  border: "2px solid",
                  borderColor: selectedFilters.class ? "var(--accent)" : "var(--text-glass-muted)",
                  background: selectedFilters.class ? "var(--accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}>
                  {selectedFilters.class && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
              </div>

              {/* Custom Checkbox Row - Subject */}
              <div
                onClick={() => toggleFilter('subject')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: selectedFilters.subject ? "rgba(234, 88, 12, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid",
                  borderColor: selectedFilters.subject ? "var(--accent)" : "var(--glass-border)",
                  cursor: "pointer",
                  transition: "all 0.2s var(--transition-smooth)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Filter by Subject</span>
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "6px",
                  border: "2px solid",
                  borderColor: selectedFilters.subject ? "var(--accent)" : "var(--text-glass-muted)",
                  background: selectedFilters.subject ? "var(--accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}>
                  {selectedFilters.subject && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
              </div>

              {/* Custom Checkbox Row - Status */}
              <div
                onClick={() => toggleFilter('status')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: selectedFilters.status ? "rgba(234, 88, 12, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid",
                  borderColor: selectedFilters.status ? "var(--accent)" : "var(--glass-border)",
                  cursor: "pointer",
                  transition: "all 0.2s var(--transition-smooth)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 500 }}>Filter by Status</span>
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "6px",
                  border: "2px solid",
                  borderColor: selectedFilters.status ? "var(--accent)" : "var(--text-glass-muted)",
                  background: selectedFilters.status ? "var(--accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}>
                  {selectedFilters.status && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            transition: "transform 0.15s ease",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {user?.email ? user.email[0].toUpperCase() : "U"}
        </button>

        {showDropdown && (
          <div
            className="glass-panel"
            style={{
              position: "absolute",
              top: "52px",
              right: 0,
              width: "250px",
              padding: "12px",
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
              color: "var(--text-glass)",
              borderRadius: "16px",
            }}
          >
            {/* Profile Summary Header */}
            <div style={{ padding: "8px 8px 12px 8px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", color: "var(--accent)"
              }}>
                {user?.email ? user.email[0].toUpperCase() : "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </div>
                <div style={{ display: "inline-block", fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", marginTop: "4px", backgroundColor: badge.bg, color: badge.text }}>
                  {user?.role}
                </div>
              </div>
            </div>
            
            {/* Edit Profile */}
            <button
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "none", border: "none", color: "inherit",
                width: "100%", textAlign: "left", cursor: "pointer", fontSize: "13px", borderRadius: "8px", transition: "all 0.2s"
              }}
              className="sidebar-link-hover"
              onClick={() => alert("Edit Profile modal triggered")}
            >
              <User size={16} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>Edit Profile</span>
                <span style={{ fontSize: "9px", color: "var(--text-glass-muted)" }}>Update details & credentials</span>
              </div>
            </button>

            {/* Toggle Theme */}
            <button
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "none", border: "none", color: "inherit",
                width: "100%", textAlign: "left", cursor: "pointer", fontSize: "13px", borderRadius: "8px", transition: "all 0.2s"
              }}
              className="sidebar-link-hover"
              onClick={() => {
                const activeTheme = document.body.getAttribute("data-theme");
                document.body.setAttribute("data-theme", activeTheme === "cream" ? "charcoal" : "cream");
              }}
            >
              <Settings size={16} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>Toggle Theme</span>
                <span style={{ fontSize: "9px", color: "var(--text-glass-muted)" }}>Swap light and dark modes</span>
              </div>
            </button>
            
            {/* Logout */}
            <button
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "none", border: "none", color: "#f87171",
                width: "100%", textAlign: "left", cursor: "pointer", fontSize: "13px", borderRadius: "8px", transition: "all 0.2s",
                marginTop: "4px", borderTop: "1px solid var(--glass-border)", paddingTop: "10px"
              }}
              className="sidebar-link-hover"
              onClick={logout}
            >
              <LogOut size={16} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>Sign Out</span>
                <span style={{ fontSize: "9px", color: "#f87171" }}>Terminate current session</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
