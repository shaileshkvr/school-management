import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send, Image as ImageIcon, ChevronDown } from "lucide-react";

const API_URL = "http://localhost:9091/api";

interface ClassItem {
  id: string;
  name: string;
}

/**
 * Checks which section category (Primary, Secondary, Senior Sec) a class belongs to
 */
const getClassSection = (className: string): "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY" | "OTHER" => {
  const match = className.match(/Grade (\d+)/);
  if (!match) return "OTHER";
  const grade = parseInt(match[1]);
  if (grade >= 1 && grade <= 5) return "PRIMARY";
  if (grade >= 6 && grade <= 10) return "SECONDARY";
  if (grade >= 11 && grade <= 12) return "SENIOR_SECONDARY";
  return "OTHER";
};

export const CreateNoticePage: React.FC = () => {
  const navigate = useNavigate();

  // Form parameters
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  
  // UI States
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section visibility toggles
  const [showPrimaryCollapse, setShowPrimaryCollapse] = useState(false);
  const [showSecondaryCollapse, setShowSecondaryCollapse] = useState(false);
  const [showSeniorCollapse, setShowSeniorCollapse] = useState(false);

  /**
   * Loads classroom details from the backend on component mount
   */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/admin/classes`);
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to load classes for targeting notice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Categorize loaded classrooms
  const primaryClasses = classes.filter((c) => getClassSection(c.name) === "PRIMARY");
  const secondaryClasses = classes.filter((c) => getClassSection(c.name) === "SECONDARY");
  const seniorClasses = classes.filter((c) => getClassSection(c.name) === "SENIOR_SECONDARY");

  /**
   * Toggles selection of a specific class checkbox
   */
  const handleToggleClass = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter((id) => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  /**
   * Toggles selection of all classes within a specific section category
   */
  const handleToggleWholeSection = (section: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY") => {
    const targetClasses =
      section === "PRIMARY"
        ? primaryClasses
        : section === "SECONDARY"
        ? secondaryClasses
        : seniorClasses;
    
    const targetIds = targetClasses.map((c) => c.id);
    const allSelected = targetIds.every((id) => selectedClassIds.includes(id));

    if (allSelected) {
      // Remove all
      setSelectedClassIds(selectedClassIds.filter((id) => !targetIds.includes(id)));
    } else {
      // Add all
      const uniqueNewIds = Array.from(new Set([...selectedClassIds, ...targetIds]));
      setSelectedClassIds(uniqueNewIds);
    }
  };

  /**
   * Checks if all classes in a section are currently selected
   */
  const isSectionFullySelected = (section: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY"): boolean => {
    const targetClasses =
      section === "PRIMARY"
        ? primaryClasses
        : section === "SECONDARY"
        ? secondaryClasses
        : seniorClasses;
    if (targetClasses.length === 0) return false;
    return targetClasses.map((c) => c.id).every((id) => selectedClassIds.includes(id));
  };

  /**
   * Validates and submits the notice form payload to the backend server
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Bulletin Header and Notice text are required.");
      return;
    }
    if (!isGlobal && selectedClassIds.length === 0) {
      setError("Please select at least one target class or choose Global Announcement.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = isGlobal
        ? { title, message }
        : { title, message, classIds: selectedClassIds };

      await axios.post(`${API_URL}/admin/notices`, payload);
      navigate("/admin/notices");
    } catch (err: unknown) {
      console.error("Failed to post notice announcement:", err);
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to publish notice. Try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-glass-muted)" }}>
        <h3>Loading configuration files...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: "780px" }}>
      {/* Back button header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => navigate("/admin/notices")}
          className="glass-panel"
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg)",
            color: "var(--text-glass)",
            borderRadius: "50%",
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 style={{ color: "var(--text-canvas)", fontSize: "1.6rem", fontWeight: "700" }}>Publish New Notice</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "1.5rem", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {error && (
          <div style={{ padding: "10px 12px", background: "rgba(255, 59, 48, 0.12)", border: "1px solid rgba(255, 59, 48, 0.2)", borderRadius: "8px", color: "#ff3b30", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {/* Notice Header Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-glass-muted)", textTransform: "uppercase" }}>Bulletin Header / Title</label>
          <input
            type="text"
            placeholder="Notice headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-panel glass-input"
            required
            style={{
              height: "40px", fontSize: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)", color: "var(--text-glass)", width: "100%"
            }}
          />
        </div>

        {/* Notice Message Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-glass-muted)", textTransform: "uppercase" }}>Notice Message Body</label>
          <textarea
            placeholder="Write details of notice bulletin here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="glass-panel glass-input"
            required
            rows={6}
            style={{
              fontSize: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)", color: "var(--text-glass)", width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: "1.5"
            }}
          />
        </div>

        {/* Target Options Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-glass-muted)", textTransform: "uppercase" }}>Target Audience</label>
          <div style={{ display: "flex", gap: "12px" }}>
            {/* Global button selector */}
            <button
              type="button"
              onClick={() => {
                setIsGlobal(true);
                setSelectedClassIds([]);
              }}
              style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid",
                borderColor: isGlobal ? "var(--accent)" : "var(--glass-border)",
                background: isGlobal ? "rgba(140, 94, 60, 0.12)" : "rgba(255,255,255,0.02)",
                color: "var(--text-glass)", cursor: "pointer", fontWeight: "600", fontSize: "13px"
              }}
            >
              Global Board (All School)
            </button>
            {/* Class target selector */}
            <button
              type="button"
              onClick={() => setIsGlobal(false)}
              style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid",
                borderColor: !isGlobal ? "var(--accent)" : "var(--glass-border)",
                background: !isGlobal ? "rgba(140, 94, 60, 0.12)" : "rgba(255,255,255,0.02)",
                color: "var(--text-glass)", cursor: "pointer", fontWeight: "600", fontSize: "13px"
              }}
            >
              Class Registers Specific
            </button>
          </div>
        </div>

        {/* Collapsible Classroom Selectors (Only shown if specific classes is selected) */}
        {!isGlobal && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(0,0,0,0.1)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--glass-border)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Target Class Registers</span>
            
            {/* Primary Section */}
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowPrimaryCollapse(!showPrimaryCollapse)}
                  style={{
                    background: "none", border: "none", color: "var(--text-glass)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <span>Primary Section (Grades 1-5)</span>
                  <ChevronDown size={14} style={{ transform: showPrimaryCollapse ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleWholeSection("PRIMARY")}
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                >
                  {isSectionFullySelected("PRIMARY") ? "Deselect All" : "Select All"}
                </button>
              </div>
              {showPrimaryCollapse && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  {primaryClasses.map((cls) => {
                    const isChecked = selectedClassIds.includes(cls.id);
                    return (
                      <label key={cls.id} style={{
                        display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: "6px",
                        border: "1px solid", borderColor: isChecked ? "var(--accent)" : "var(--glass-border)",
                        background: isChecked ? "rgba(140, 94, 60, 0.12)" : "rgba(255,255,255,0.01)",
                        fontSize: "12px", cursor: "pointer", gap: "6px"
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleClass(cls.id)}
                          style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                        />
                        <span>{cls.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Secondary Section */}
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowSecondaryCollapse(!showSecondaryCollapse)}
                  style={{
                    background: "none", border: "none", color: "var(--text-glass)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <span>Secondary Section (Grades 6-10)</span>
                  <ChevronDown size={14} style={{ transform: showSecondaryCollapse ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleWholeSection("SECONDARY")}
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                >
                  {isSectionFullySelected("SECONDARY") ? "Deselect All" : "Select All"}
                </button>
              </div>
              {showSecondaryCollapse && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  {secondaryClasses.map((cls) => {
                    const isChecked = selectedClassIds.includes(cls.id);
                    return (
                      <label key={cls.id} style={{
                        display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: "6px",
                        border: "1px solid", borderColor: isChecked ? "var(--accent)" : "var(--glass-border)",
                        background: isChecked ? "rgba(140, 94, 60, 0.12)" : "rgba(255,255,255,0.01)",
                        fontSize: "12px", cursor: "pointer", gap: "6px"
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleClass(cls.id)}
                          style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                        />
                        <span>{cls.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Senior Secondary Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowSeniorCollapse(!showSeniorCollapse)}
                  style={{
                    background: "none", border: "none", color: "var(--text-glass)", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <span>Senior Secondary Section (Grades 11-12)</span>
                  <ChevronDown size={14} style={{ transform: showSeniorCollapse ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleWholeSection("SENIOR_SECONDARY")}
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                >
                  {isSectionFullySelected("SENIOR_SECONDARY") ? "Deselect All" : "Select All"}
                </button>
              </div>
              {showSeniorCollapse && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  {seniorClasses.map((cls) => {
                    const isChecked = selectedClassIds.includes(cls.id);
                    return (
                      <label key={cls.id} style={{
                        display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: "6px",
                        border: "1px solid", borderColor: isChecked ? "var(--accent)" : "var(--glass-border)",
                        background: isChecked ? "rgba(140, 94, 60, 0.12)" : "rgba(255,255,255,0.01)",
                        fontSize: "12px", cursor: "pointer", gap: "6px"
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleClass(cls.id)}
                          style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                        />
                        <span>{cls.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Image Upload & Submission controls */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--glass-border)", paddingTop: "1.25rem", flexWrap: "wrap" }}>
          {/* Disabled File Upload trigger */}
          <button
            type="button"
            disabled
            style={{
              padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
              color: "var(--text-glass-muted)", cursor: "not-allowed", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", opacity: 0.6
            }}
          >
            <ImageIcon size={16} />
            <span>Image Upload (disabled - coming soon)</span>
          </button>

          {/* Form submit button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginLeft: "auto", padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--accent)",
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600",
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)"
            }}
          >
            <Send size={15} />
            <span>{submitting ? "Publishing Bulletin..." : "Publish Bulletin"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
