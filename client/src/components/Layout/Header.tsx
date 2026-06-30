import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Search, SlidersHorizontal, LogOut, Settings, User, ChevronDown } from "lucide-react";

const API_URL = "http://localhost:9091/api";


interface ClassDataResponse {
  id: string;
  name: string;
}

interface TeacherDataResponse {
  id: string;
  group: string;
}

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Router Location & Search Params Integration
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const isStudentsPage = location.pathname === "/admin/students";
  const isTeachersPage = location.pathname === "/admin/teachers";
  const isNoticesPage = location.pathname.startsWith("/admin/notices") && !location.pathname.endsWith("/new");
  const showFilterButton = isStudentsPage || isTeachersPage || isNoticesPage;

  // Active query parameter bindings
  const q = searchParams.get("q") || "";

  // Dynamic filter collections
  const [classesList, setClassesList] = useState<string[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [showTaughtCollapse, setShowTaughtCollapse] = useState(false);

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

  // Fetch unique filter values dynamically if page supports filters
  useEffect(() => {
    if (!showFilterButton) return;
    const fetchFilterDependencies = async () => {
      try {
        const [resClasses, resTeachers] = await Promise.all([
          axios.get(`${API_URL}/admin/classes`),
          axios.get(`${API_URL}/admin/teachers`),
        ]);
        
        // Extract classes names
        const classNames = resClasses.data.map((c: ClassDataResponse) => c.name);
        setClassesList(classNames.sort());

        // Group-to-Subject map based on academic seeding
        const groupSubjects: Record<string, string[]> = {
          PRIMARY: ["English", "Mathematics", "Science", "Hindi", "Computer Science", "Geography"],
          SECONDARY: ["Physics", "Chemistry", "Biology", "Mathematics", "Social-Science", "English Literature"],
          SENIOR_SECONDARY: ["Accountancy", "Business Studies", "Physics", "Chemistry", "Economics", "History", "Sociology"],
          SPECIAL: ["Computer Science", "Fine Arts", "Music", "Physical Education"],
        };

        // Extract subjects dynamically
        const subjectsSet = new Set<string>();
        resTeachers.data.forEach((t: TeacherDataResponse) => {
          const subjects = groupSubjects[t.group] || ["General Studies"];
          const subjectIndex = parseInt(t.id.slice(0, 4), 16) % subjects.length;
          subjectsSet.add(subjects[subjectIndex]);
        });
        setSubjectsList(Array.from(subjectsSet).sort());
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    };
    fetchFilterDependencies();
  }, [showFilterButton]);

  /**
   * Helper function to modify query parameters in the URL query string
   */
  const updateQueryParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value === "ALL" || value === "") {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };

  /**
   * Toggles class checkboxes in the url parameter string (e.g. classes=Grade+8-A,Grade+8-B)
   */
  const handleClassesFilterChange = (className: string) => {
    setSearchParams((prev) => {
      const currentVal = prev.get("classes") || "";
      const currentList = currentVal ? currentVal.split(",") : [];
      let newList: string[];
      if (currentList.includes(className)) {
        newList = currentList.filter(c => c !== className);
      } else {
        newList = [...currentList, className];
      }
      if (newList.length === 0) {
        prev.delete("classes");
      } else {
        prev.set("classes", newList.join(","));
      }
      return prev;
    });
  };

  /**
   * Returns a parsed string array of active classes filtered
   */
  const getSelectedClassesFilterList = (): string[] => {
    const val = searchParams.get("classes") || "";
    return val ? val.split(",") : [];
  };

  /**
   * Resets all filter values but preserves search query 'q'
   */
  const clearAllFilters = () => {
    setSearchParams((prev) => {
      const qVal = prev.get("q");
      Array.from(prev.keys()).forEach(key => prev.delete(key));
      if (qVal) {
        prev.set("q", qVal);
      }
      return prev;
    });
    setShowFilters(false);
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
            placeholder={isStudentsPage ? "Search students by name..." : isTeachersPage ? "Search teachers by name or Emp ID..." : isNoticesPage ? "Search notices by title or message..." : "Search dashboard logs..."}
            value={q}
            onChange={(e) => updateQueryParam("q", e.target.value)}
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
        
        {/* Dynamic Filters Trigger */}
        {showFilterButton && (
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
                  gap: "12px",
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid var(--glass-border)",
                  boxShadow: "var(--glass-shadow)",
                  color: "var(--text-glass)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ fontWeight: "700", fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.05em", borderBottom: "1px solid var(--glass-border)", paddingBottom: "4px" }}>
                  {isStudentsPage ? "Student Filters" : isTeachersPage ? "Faculty Filters" : "Notice Filters"}
                </div>

                {/* Render Students Page Filter Menus */}
                {isStudentsPage && (
                  <>
                    {/* Fee status */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Fees Status</label>
                      <select
                        value={searchParams.get("fees") || "ALL"}
                        onChange={(e) => updateQueryParam("fees", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Fees</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="UNPAID">Unpaid</option>
                      </select>
                    </div>

                    {/* Average Rating */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Average Rating</label>
                      <select
                        value={searchParams.get("rating") || "ALL"}
                        onChange={(e) => updateQueryParam("rating", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Ratings</option>
                        <option value="HIGH">Highly Rated (&ge; 4.5)</option>
                        <option value="MID">Average (4.0 - 4.5)</option>
                        <option value="LOW">Alert / Low (&lt; 4.0)</option>
                      </select>
                    </div>

                    {/* Attendance Alert */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Attendance</label>
                      <select
                        value={searchParams.get("attendance") || "ALL"}
                        onChange={(e) => updateQueryParam("attendance", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Attendance</option>
                        <option value="OK">Regular (&ge; 75%)</option>
                        <option value="LOW">Low Attendance Alert (&lt; 75%)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Render Teachers Page Filter Menus */}
                {isTeachersPage && (
                  <>
                    {/* Seniority */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Seniority</label>
                      <select
                        value={searchParams.get("seniority") || "ALL"}
                        onChange={(e) => updateQueryParam("seniority", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Seniority</option>
                        <option value="JUNIOR">Junior (&lt; 2 yrs)</option>
                        <option value="MID">Mid-Level (2-5 yrs)</option>
                        <option value="SENIOR">Senior (&gt; 5 yrs)</option>
                      </select>
                    </div>

                    {/* Specialty Subject */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Specialty Subject</label>
                      <select
                        value={searchParams.get("subject") || "ALL"}
                        onChange={(e) => updateQueryParam("subject", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Subjects</option>
                        {subjectsList.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    {/* Gender */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Gender</label>
                      <select
                        value={searchParams.get("gender") || "ALL"}
                        onChange={(e) => updateQueryParam("gender", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Collapsible Classes Taught checkboxes */}
                    <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "10px", marginTop: "4px" }}>
                      <button
                        onClick={() => setShowTaughtCollapse(!showTaughtCollapse)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent)",
                          width: "100%",
                          textAlign: "left",
                          fontWeight: "700",
                          fontSize: "10px",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Classes Taught</span>
                        <ChevronDown size={12} style={{ transform: showTaughtCollapse ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                      </button>

                      {showTaughtCollapse && (
                        <div style={{
                          maxHeight: "120px",
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          marginTop: "6px",
                          padding: "6px",
                          background: "rgba(0, 0, 0, 0.12)",
                          borderRadius: "6px"
                        }}>
                          {classesList.map((className) => {
                            const classesFilterList = getSelectedClassesFilterList();
                            const isChecked = classesFilterList.includes(className);
                            return (
                              <label key={className} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleClassesFilterChange(className)}
                                  style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                                />
                                <span>{className}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Render Notices Page Filter Menus */}
                {isNoticesPage && (
                  <>
                    {/* Scope Filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Notice Scope</label>
                      <select
                        value={searchParams.get("scope") || "ALL"}
                        onChange={(e) => updateQueryParam("scope", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Notices</option>
                        <option value="GLOBAL">Global Announcements</option>
                        <option value="CLASS">Class Specific Notices</option>
                      </select>
                    </div>

                    {/* Section Filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10px", color: "var(--text-glass-muted)", fontWeight: "700", textTransform: "uppercase" }}>Target Section</label>
                      <select
                        value={searchParams.get("section") || "ALL"}
                        onChange={(e) => updateQueryParam("section", e.target.value)}
                        className="glass-panel"
                        style={{
                          fontSize: "12px",
                          padding: "0 10px",
                          height: "36px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        <option value="ALL">All Sections</option>
                        <option value="PRIMARY">Primary (Grades 1-5)</option>
                        <option value="SECONDARY">Secondary (Grades 6-10)</option>
                        <option value="SENIOR_SECONDARY">Senior Secondary (Grades 11-12)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Reset Filters Option Button */}
                <button
                  onClick={clearAllFilters}
                  style={{
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#ff3b30",
                    background: "rgba(255, 59, 48, 0.1)",
                    border: "1px solid rgba(255, 59, 48, 0.2)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "6px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 59, 48, 0.18)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 59, 48, 0.1)"}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notices Create button */}
        {isNoticesPage && (
          <Link
            to="/admin/notices/new"
            className="glass-panel"
            style={{
              padding: "0 16px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              textDecoration: "none",
              transition: "transform 0.15s ease",
              justifyContent: "center",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span style={{ whiteSpace: "nowrap" }}>+ Create</span>
          </Link>
        )}
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
