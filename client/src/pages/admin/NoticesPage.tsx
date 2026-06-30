import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Calendar, Mail, Tag, X, Trash2 } from "lucide-react";
import { useConfirm } from "../../context/ConfirmContext";

const API_URL = "http://localhost:9091/api";

interface Notice {
  id: string;
  title: string;
  message: string;
  classId: string | null;
  targetUserId: string | null;
  createdAt: string;
  createdById: string;
  createdBy: {
    email: string;
  };
}

interface ClassResponse {
  id: string;
  name: string;
}

/**
 * Checks which section category (Primary, Secondary, Senior Sec) a class belongs to
 */
const getClassSection = (className: string): string => {
  const match = className.match(/Grade (\d+)/);
  if (!match) return "GLOBAL";
  const grade = parseInt(match[1]);
  if (grade >= 1 && grade <= 5) return "PRIMARY";
  if (grade >= 6 && grade <= 10) return "SECONDARY";
  if (grade >= 11 && grade <= 12) return "SENIOR_SECONDARY";
  return "GLOBAL";
};

export const NoticesPage: React.FC = () => {
  const { id: routeNoticeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirm = useConfirm();

  // DB States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classesLookup, setClassesLookup] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Active selections derived from URL Route parameter
  const selectedNotice = routeNoticeId ? notices.find((n) => n.id === routeNoticeId) || null : null;
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  // Read header search and filter params
  const q = searchParams.get("q") || "";
  const scopeFilter = searchParams.get("scope") || "ALL"; // ALL, GLOBAL, CLASS
  const sectionFilter = searchParams.get("section") || "ALL"; // ALL, PRIMARY, SECONDARY, SENIOR_SECONDARY

  /**
   * Fetches notices and classes on component mount
   */
  useEffect(() => {
    const fetchNoticesAndClasses = async () => {
      try {
        setLoading(true);
        const [resNotices, resClasses] = await Promise.all([
          axios.get(`${API_URL}/admin/notices`),
          axios.get(`${API_URL}/admin/classes`),
        ]);

        const classesMap: Record<string, string> = {};
        resClasses.data.forEach((c: ClassResponse) => {
          classesMap[c.id] = c.name;
        });

        setClassesLookup(classesMap);
        setNotices(resNotices.data);
      } catch (err) {
        console.error("Failed to load notice registers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticesAndClasses();
  }, []);

  /**
   * Closes reading panel and resets route to main directory list
   */
  const handleCloseReadingPanel = () => {
    navigate("/admin/notices");
  };

  /**
   * Opens reading panel and changes path to notice ID
   */
  const handleNoticeSelect = (notice: Notice) => {
    navigate(`/admin/notices/${notice.id}`);
  };

  /**
   * Sends DELETE request to remove a notice and updates local state
   */
  const handleDeleteNotice = async (noticeId: string) => {
    const isConfirmed = await confirm({
      title: "Delete Announcement",
      message: "Are you sure you want to delete this notice announcement? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "warning",
    });

    if (!isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/admin/notices/${noticeId}`);

      // Close reading panel if the deleted notice is active
      if (routeNoticeId === noticeId) {
        navigate("/admin/notices");
      }

      // Remove notice from local state
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } catch (err: unknown) {
      console.error("Failed to delete notice:", err);
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to delete notice. Please try again.";
      
      await confirm({
        title: "Delete Failed",
        message: errorMessage,
        confirmText: "Close",
        type: "error"
      });
    }
  };

  /**
   * Filters notices dynamically matching title/message keywords and dynamic scope targets
   */
  const getFilteredNotices = () => {
    return notices.filter((n) => {
      // 1. Search text filter
      const matchesSearch =
        n.title.toLowerCase().includes(q.toLowerCase()) ||
        n.message.toLowerCase().includes(q.toLowerCase());

      // 2. Scope filter (Global vs Class specific)
      let matchesScope = true;
      if (scopeFilter === "GLOBAL") matchesScope = n.classId === null;
      if (scopeFilter === "CLASS") matchesScope = n.classId !== null;

      // 3. Section specific filter (Primary/Secondary/Senior Sec)
      let matchesSection = true;
      if (sectionFilter !== "ALL") {
        if (!n.classId) {
          matchesSection = false; // Global notices don't have a section classId
        } else {
          const className = classesLookup[n.classId] || "";
          matchesSection = getClassSection(className) === sectionFilter;
        }
      }

      return matchesSearch && matchesScope && matchesSection;
    });
  };

  const filteredNotices = getFilteredNotices();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-glass-muted)" }}>
        <h3>Loading announcements board...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      <div>
        <h2 style={{ color: "var(--text-canvas)", fontSize: "1.8rem", fontWeight: "700" }}>Announcements Board</h2>
        <p style={{ color: "var(--text-canvas-muted, #7c7c82)", fontSize: "0.95rem", marginTop: "4px" }}>
          Publish bulletins, target notice files to classes, and issue official statements
        </p>
      </div>

      <div style={{ display: "flex", gap: "1rem", width: "100%", alignItems: "flex-start" }}>
        
        {/* Notices list column panel */}
        <div
          className="glass-panel"
          style={{
            flex: selectedNotice ? "0 0 45%" : "1 1 100%",
            transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            padding: "1.25rem",
            borderRadius: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowX: "hidden"
          }}
        >
          <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent)" }}>Bulletin Register</h3>
            <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>
              {filteredNotices.length} Bulletins
            </span>
          </div>

          {filteredNotices.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredNotices.map((notice) => {
                const isSelected = selectedNotice?.id === notice.id;
                const dateStr = new Date(notice.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric"
                });
                const scopeName = notice.classId ? classesLookup[notice.classId] || "Class Specific" : "Global Scope";
                
                return (
                  <div
                    key={notice.id}
                    onClick={() => handleNoticeSelect(notice)}
                    style={{
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: isSelected ? "var(--accent)" : "var(--glass-border)",
                      background: isSelected ? "rgba(140, 94, 60, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}
                    className="sidebar-link-hover"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: isSelected ? "var(--accent)" : "var(--text-glass)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {notice.title}
                      </h4>
                      <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>{dateStr}</span>
                    </div>
                    
                    <p style={{ fontSize: "12px", color: "var(--text-glass-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {notice.message}
                    </p>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span style={{
                        fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px",
                        backgroundColor: notice.classId ? "rgba(234, 88, 12, 0.15)" : "rgba(52, 199, 89, 0.15)",
                        color: notice.classId ? "#ea580c" : "#34c759"
                      }}>
                        {scopeName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-glass-muted)" }}>
              No notices published on this scope.
            </div>
          )}
        </div>

        {/* Dynamic reading panel workspace */}
        {selectedNotice && (
          <div
            className="glass-panel"
            style={{
              flex: "1 1 55%",
              transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
              padding: "1.5rem",
              borderRadius: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              position: "sticky",
              top: "16px",
              boxShadow: "var(--glass-shadow)"
            }}
          >
            {/* Header control buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-glass)" }}>{selectedNotice.title}</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "6px", alignItems: "center", fontSize: "12px", color: "var(--text-glass-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Mail size={13} />
                    <span>{selectedNotice.createdBy?.email}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} />
                    <span>{new Date(selectedNotice.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Delete announcement button */}
                <button
                  onClick={() => handleDeleteNotice(selectedNotice.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-glass-muted)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-glass-muted)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title="Delete Announcement"
                >
                  <Trash2 size={20} />
                </button>

                {/* Close reading panel button */}
                <button
                  onMouseEnter={() => setIsCloseHovered(true)}
                  onMouseLeave={() => setIsCloseHovered(false)}
                  onClick={handleCloseReadingPanel}
                  style={{
                    background: "none",
                    border: "none",
                    color: isCloseHovered ? "#ef4444" : "var(--text-glass)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease, transform 0.15s ease",
                    transform: isCloseHovered ? "scale(1.15) rotate(90deg)" : "scale(1) rotate(0deg)"
                  }}
                  title="Close Reading Panel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scope Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Tag size={13} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent)" }}>Notice Scope:</span>
              <span style={{
                fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px",
                backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)"
              }}>
                {selectedNotice.classId ? classesLookup[selectedNotice.classId] || "Class Specific" : "All School (Global Board)"}
              </span>
            </div>

            {/* Main readable message text (with word wrapped support) */}
            <div style={{
              fontSize: "15px",
              lineHeight: "1.6",
              color: "var(--text-glass)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "450px",
              overflowY: "auto",
              paddingRight: "6px"
            }}>
              {selectedNotice.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
