import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface Notice {
  id: string;
  title: string;
  message: string;
  classId: string | null;
  createdAt: string;
  createdBy: {
    email: string;
  };
}

interface ClassItem {
  id: string;
  name: string;
}

export const PostAnnouncements: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [noticesRes, classesRes] = await Promise.all([
        api.get("/admin/notices"),
        api.get("/admin/classes"),
      ]);
      setNotices(noticesRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error("Failed to fetch notices or classes:", err);
    } finally {
      setLoading(false);
    }
  }

  const getSectionGroup = (name: string): "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY" => {
    const match = name.match(/Grade\s+(\d+)/);
    if (!match) return "PRIMARY";
    const gradeNum = parseInt(match[1]);
    if (gradeNum <= 5) return "PRIMARY";
    if (gradeNum <= 10) return "SECONDARY";
    return "SENIOR_SECONDARY";
  };

  const primaryClasses = classes.filter((c) => getSectionGroup(c.name) === "PRIMARY");
  const secondaryClasses = classes.filter((c) => getSectionGroup(c.name) === "SECONDARY");
  const seniorSecondaryClasses = classes.filter((c) => getSectionGroup(c.name) === "SENIOR_SECONDARY");

  const toggleClassSelection = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getSectionClassIds = (section: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY") => {
    return classes
      .filter((c) => getSectionGroup(c.name) === section)
      .map((c) => c.id);
  };

  const isWholeSectionSelected = (section: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY") => {
    const sectionIds = getSectionClassIds(section);
    if (sectionIds.length === 0) return false;
    return sectionIds.every((id) => selectedClassIds.includes(id));
  };

  const toggleWholeSection = (section: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY") => {
    const sectionIds = getSectionClassIds(section);
    const allSelected = isWholeSectionSelected(section);

    if (allSelected) {
      setSelectedClassIds((prev) => prev.filter((id) => !sectionIds.includes(id)));
    } else {
      setSelectedClassIds((prev) => {
        const unique = new Set([...prev, ...sectionIds]);
        return Array.from(unique);
      });
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!title.trim() || !message.trim()) {
      setSubmitError("Title and message are required.");
      return;
    }

    if (!isGlobal && selectedClassIds.length === 0) {
      setSubmitError("Please select at least one target class or choose Global Announcement.");
      return;
    }

    try {
      await api.post("/admin/notices", {
        title: title.trim(),
        message: message.trim(),
        classIds: isGlobal ? [] : selectedClassIds,
      });

      setSuccessMessage("Announcement published successfully!");
      setTitle("");
      setMessage("");
      setSelectedClassIds([]);
      setIsGlobal(true);
      
      // Refresh list
      const noticesRes = await api.get("/admin/notices");
      setNotices(noticesRes.data);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to post notice:", err);
      setSubmitError(err.response?.data?.error || "Failed to post announcement.");
    }
  };

  return (
    <DashboardLayout title="Post Announcements">
      {successMessage && <div className="toast-success">{successMessage}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
        {/* Create Form */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem" }}>Publish New Notice</h3>
          {submitError && <div className="alert alert-danger">{submitError}</div>}

          <form onSubmit={handlePostNotice}>
            <div className="form-group">
              <label className="form-label">Notice Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Science Lab Rescheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Audience Scope</label>
              
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => {
                    setIsGlobal(e.target.checked);
                    if (e.target.checked) setSelectedClassIds([]);
                  }}
                  style={{ accentColor: "var(--color-brand)" }}
                />
                <strong>Global Announcement (All Students & Teachers)</strong>
              </label>

              {!isGlobal && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
                  
                  {/* Primary Section */}
                  <div style={{ background: "rgba(0,0,0,0.01)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Primary Section (Grades 1-5)</strong>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                        onClick={() => toggleWholeSection("PRIMARY")}
                      >
                        {isWholeSectionSelected("PRIMARY") ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {primaryClasses.map((cls) => (
                        <label
                          key={cls.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.3rem 0.6rem",
                            background: selectedClassIds.includes(cls.id) ? "var(--color-brand-glow)" : "var(--bg-input)",
                            border: selectedClassIds.includes(cls.id) ? "1px solid var(--color-brand)" : "1px solid var(--border-glass)",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(cls.id)}
                            onChange={() => toggleClassSelection(cls.id)}
                            style={{ display: "none" }}
                          />
                          {cls.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Section */}
                  <div style={{ background: "rgba(0,0,0,0.01)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Secondary Section (Grades 6-10)</strong>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                        onClick={() => toggleWholeSection("SECONDARY")}
                      >
                        {isWholeSectionSelected("SECONDARY") ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {secondaryClasses.map((cls) => (
                        <label
                          key={cls.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.3rem 0.6rem",
                            background: selectedClassIds.includes(cls.id) ? "var(--color-brand-glow)" : "var(--bg-input)",
                            border: selectedClassIds.includes(cls.id) ? "1px solid var(--color-brand)" : "1px solid var(--border-glass)",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(cls.id)}
                            onChange={() => toggleClassSelection(cls.id)}
                            style={{ display: "none" }}
                          />
                          {cls.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Senior Secondary Section */}
                  <div style={{ background: "rgba(0,0,0,0.01)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Senior Secondary Section (Grades 11-12)</strong>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                        onClick={() => toggleWholeSection("SENIOR_SECONDARY")}
                      >
                        {isWholeSectionSelected("SENIOR_SECONDARY") ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {seniorSecondaryClasses.map((cls) => (
                        <label
                          key={cls.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.3rem 0.6rem",
                            background: selectedClassIds.includes(cls.id) ? "var(--color-brand-glow)" : "var(--bg-input)",
                            border: selectedClassIds.includes(cls.id) ? "1px solid var(--color-brand)" : "1px solid var(--border-glass)",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(cls.id)}
                            onChange={() => toggleClassSelection(cls.id)}
                            style={{ display: "none" }}
                          />
                          {cls.name}
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Content</label>
              <textarea
                className="form-textarea"
                placeholder="Write notice details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
              Publish Announcement
            </button>
          </form>
        </div>

        {/* Existing Notices list */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem" }}>Sent Announcements</h3>

          {loading ? (
            <div className="empty-state">
              <p>Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="empty-state">
              <p>No notices posted yet.</p>
            </div>
          ) : (
            <div className="notice-list" style={{ maxHeight: "720px", overflowY: "auto" }}>
              {notices.map((notice) => (
                <div key={notice.id} className="notice-item" style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{notice.title}</h4>
                    {notice.classId ? (
                      <span className="role-badge" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                        Class Scoped
                      </span>
                    ) : (
                      <span className="role-badge" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", background: "rgba(140, 94, 60, 0.15)", color: "var(--color-brand)" }}>
                        Global
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                    {notice.message}
                  </p>
                  <div className="notice-meta" style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                    <span>By: {notice.createdBy.email}</span>
                    <span>
                      {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
