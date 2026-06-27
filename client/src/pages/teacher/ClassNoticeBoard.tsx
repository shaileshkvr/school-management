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

export const ClassNoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
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
        api.get("/teacher/notices"),
        api.get("/teacher/classes"),
      ]);
      setNotices(noticesRes.data);
      setClasses(classesRes.data);
      if (classesRes.data.length > 0) {
        setSelectedClassId(classesRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch teacher notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!title.trim() || !message.trim() || !selectedClassId) {
      setSubmitError("Title, message, and target class are required.");
      return;
    }

    try {
      await api.post("/teacher/notices", {
        title: title.trim(),
        message: message.trim(),
        classId: selectedClassId,
      });

      setSuccessMessage("Notice posted to class board successfully!");
      setTitle("");
      setMessage("");
      
      // Refresh list
      const noticesRes = await api.get("/teacher/notices");
      setNotices(noticesRes.data);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to post notice:", err);
      setSubmitError(err.response?.data?.error || "Failed to post announcement.");
    }
  };

  return (
    <DashboardLayout title="Class Notice Board">
      {successMessage && <div className="toast-success">{successMessage}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        {/* Create Form */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem" }}>Publish Class Notice</h3>
          {submitError && <div className="alert alert-danger">{submitError}</div>}

          <form onSubmit={handlePostNotice}>
            <div className="form-group">
              <label className="form-label">Notice Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bring Science project model"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Class</label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
              >
                {classes.length === 0 && <option value="">No Classes Assigned</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "0.5rem" }}
              disabled={classes.length === 0}
            >
              Post Announcement
            </button>
          </form>
        </div>

        {/* Existing Notices list */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem" }}>Announcements history</h3>

          {loading ? (
            <div className="empty-state">
              <p>Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="empty-state">
              <p>No notices posted yet.</p>
            </div>
          ) : (
            <div className="notice-list" style={{ maxHeight: "480px", overflowY: "auto" }}>
              {notices.map((notice) => (
                <div key={notice.id} className="notice-item" style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{notice.title}</h4>
                    {notice.classId ? (
                      <span className="role-badge" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                        Class Board
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
