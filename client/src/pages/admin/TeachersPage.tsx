import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";

const API_URL = "http://localhost:9091/api";

interface Teacher {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  group: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY" | "SPECIAL";
  subject: string;
  classInCharge: string;
  classesTaught: string[];
  yearsWorking: number;
  dateJoined: string;
}

interface TeacherResponse {
  id: string;
  employeeId: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  group: "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY" | "SPECIAL";
  user?: {
    email: string;
    createdAt: string;
  };
  classesLed?: Array<{
    id: string;
    name: string;
  }>;
}

interface ClassResponse {
  id: string;
  name: string;
}

/**
 * Formats a teacher's full name from their email address (e.g. amit.sharma@school.com -> Amit Sharma)
 */
const getTeacherNameFromEmail = (email?: string): string => {
  if (!email) return "Staff Member";
  if (email === "teacher@school.com") return "Demo Teacher";
  const localPart = email.split("@")[0];
  const cleanPart = localPart.replace(/\d+$/, "");
  const nameParts = cleanPart.split(".");
  return nameParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
};

export const TeachersPage: React.FC = () => {
  // DB States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  // Filters State derived from URL Search Parameters
  const [searchParams] = useSearchParams();
  const searchText = searchParams.get("q") || "";
  const seniorityFilter = searchParams.get("seniority") || "ALL";
  const subjectFilter = searchParams.get("subject") || "ALL";
  const genderFilter = searchParams.get("gender") || "ALL";
  const selectedClassesFilter = (searchParams.get("classes") || "").split(",").filter(Boolean);

  /**
   * Fetches database records for teachers and classes on component mount
   */
  useEffect(() => {
    const fetchTeachersData = async () => {
      try {
        setLoading(true);
        const [resTeachers, resClasses] = await Promise.all([
          axios.get(`${API_URL}/admin/teachers`),
          axios.get(`${API_URL}/admin/classes`),
        ]);

        // Construct unique classes list
        const classNames: string[] = resClasses.data.map((c: ClassResponse) => c.name);

        // Group-to-Subject map based on academic seeding
        const groupSubjects: Record<string, string[]> = {
          PRIMARY: ["English", "Mathematics", "Science", "Hindi", "Computer Science", "Geography"],
          SECONDARY: ["Physics", "Chemistry", "Biology", "Mathematics", "Social-Science", "English Literature"],
          SENIOR_SECONDARY: ["Accountancy", "Business Studies", "Physics", "Chemistry", "Economics", "History", "Sociology"],
          SPECIAL: ["Computer Science", "Fine Arts", "Music", "Physical Education"],
        };

        // Project database rows to UI structure
        const mappedTeachers: Teacher[] = resTeachers.data.map((t: TeacherResponse) => {
          const createdDate = new Date(t.user?.createdAt || "2024-06-01T00:00:00.000Z");
          const yearsWorking = Math.max(1, new Date().getFullYear() - createdDate.getFullYear());
          const dateJoined = createdDate.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          // Subject mapping based on group & employee ID index
          const subjects = groupSubjects[t.group] || ["General Studies"];
          const subjectIndex = parseInt(t.id.slice(0, 4), 16) % subjects.length;
          const subject = subjects[subjectIndex];

          // Class in charge
          const ledClass = t.classesLed && t.classesLed.length > 0 ? t.classesLed[0].name : "None";

          // Other classes taught (exclude ledClass, match by group rules)
          const classesTaught = classNames
            .filter((name: string) => {
              if (name === ledClass) return false;
              if (t.group === "PRIMARY") {
                return name.startsWith("Grade 1") || name.startsWith("Grade 2") || name.startsWith("Grade 3") || name.startsWith("Grade 4") || name.startsWith("Grade 5");
              }
              if (t.group === "SECONDARY") {
                return name.startsWith("Grade 6") || name.startsWith("Grade 7") || name.startsWith("Grade 8") || name.startsWith("Grade 9") || name.startsWith("Grade 10");
              }
              if (t.group === "SENIOR_SECONDARY") {
                return name.startsWith("Grade 11") || name.startsWith("Grade 12");
              }
              return name.includes("-A") || name.includes("Science");
            })
            .slice(0, 4); // Limit display to 4 classes

          return {
            id: t.id,
            employeeId: t.employeeId,
            email: t.user?.email || "teacher@school.com",
            name: getTeacherNameFromEmail(t.user?.email || "teacher@school.com"),
            gender: t.gender,
            group: t.group,
            subject,
            classInCharge: ledClass,
            classesTaught,
            yearsWorking,
            dateJoined,
          };
        });

        setTeachers(mappedTeachers);
      } catch (err) {
        console.error("Failed to retrieve teachers registers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersData();
  }, []);

  /**
   * Filters and sorts teachers based on search text, seniority, subject, gender, and classes taught
   */
  const getFilteredTeachers = () => {
    return teachers.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchText.toLowerCase()) || t.employeeId.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesGender = genderFilter === "ALL" || t.gender === genderFilter;

      const matchesSubject = subjectFilter === "ALL" || t.subject === subjectFilter;

      // Filter by seniority brackets
      let matchesSeniority = true;
      if (seniorityFilter === "JUNIOR") matchesSeniority = t.yearsWorking < 2;
      else if (seniorityFilter === "MID") matchesSeniority = t.yearsWorking >= 2 && t.yearsWorking <= 5;
      else if (seniorityFilter === "SENIOR") matchesSeniority = t.yearsWorking > 5;

      // Filter by classes taught
      let matchesClasses = true;
      if (selectedClassesFilter.length > 0) {
        matchesClasses = selectedClassesFilter.some(
          (className) => t.classesTaught.includes(className) || t.classInCharge === className
        );
      }

      return matchesSearch && matchesGender && matchesSubject && matchesSeniority && matchesClasses;
    });
  };

  const filteredTeachers = getFilteredTeachers();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-glass-muted)" }}>
        <h3>Loading teacher records from database...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      <div>
        <h2 style={{ color: "var(--text-canvas)", fontSize: "1.8rem", fontWeight: "700" }}>Teachers Administration</h2>
        <p style={{ color: "var(--text-canvas-muted, #7c7c82)", fontSize: "0.95rem", marginTop: "4px" }}>
          Manage faculty directories, course assignments, seniority tracks, and class leaders
        </p>
      </div>

      <div style={{ display: "flex", gap: "1rem", position: "relative", alignItems: "flex-start" }}>
        

        {/* Center: Main Table Section */}
        <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", borderRadius: "14px" }}>
          <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Faculty Roster</h3>
            <span style={{ fontSize: "12px", color: "var(--text-glass-muted)" }}>
              Showing {filteredTeachers.length} of {teachers.length} Teachers
            </span>
          </div>

          {filteredTeachers.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--glass-border)" }}>
                    <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Teacher Name</th>
                    <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Emp ID</th>
                    <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Specialty</th>
                    <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Incharge Class</th>
                    <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Seniority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t) => {
                    const isSelected = selectedTeacher?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTeacher(t)}
                        style={{
                          borderBottom: "1px solid var(--glass-border)",
                          cursor: "pointer",
                          background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                          transition: "background-color 0.2s"
                        }}
                        className="sidebar-link-hover"
                      >
                        <td style={{ padding: "12px 8px", fontWeight: "600" }}>{t.name}</td>
                        <td style={{ padding: "12px 8px" }}>{t.employeeId}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "600", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                            {t.subject}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", color: t.classInCharge === "None" ? "var(--text-glass-muted)" : "inherit" }}>
                          {t.classInCharge}
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          {t.yearsWorking} {t.yearsWorking === 1 ? "yr" : "yrs"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-glass-muted)" }}>
              No teachers match the active filters. Try loosening search terms.
            </div>
          )}
        </div>

        {/* Right Side: Split Card Panel Overlay */}
        {selectedTeacher && (
          <div
            className="glass-panel"
            style={{
              width: "280px",
              padding: "1.25rem",
              borderRadius: "14px",
              position: "sticky",
              top: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              boxShadow: "var(--glass-shadow)",
              animation: "slideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent)" }}>
                Faculty Details
              </h4>
              <button
                onMouseEnter={() => setIsCloseHovered(true)}
                onMouseLeave={() => setIsCloseHovered(false)}
                onClick={() => setSelectedTeacher(null)}
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
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile summary headers */}
            <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.75rem" }}>
              <div style={{ fontSize: "16px", fontWeight: "700" }}>{selectedTeacher.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-glass-muted)", marginTop: "4px" }}>
                Emp ID: {selectedTeacher.employeeId} ({selectedTeacher.gender.toLowerCase()})
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Specialty Subject</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent)", marginTop: "2px" }}>{selectedTeacher.subject}</div>
              </div>

              <div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Class Teacher Incharge Of</div>
                <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedTeacher.classInCharge}</div>
              </div>

              <div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Other Classes Taught</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {selectedTeacher.classesTaught.length > 0 ? (
                    selectedTeacher.classesTaught.map((c) => (
                      <span
                        key={c}
                        style={{
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--glass-border)"
                        }}
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", fontStyle: "italic", color: "var(--text-glass-muted)" }}>None Assigned</span>
                  )}
                </div>
              </div>

              {/* Joined metadata dates */}
              <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "10px", marginTop: "4px" }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>School Service Tenure</div>
                <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>
                  {selectedTeacher.yearsWorking} {selectedTeacher.yearsWorking === 1 ? "Year" : "Years"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-glass-muted)", marginTop: "2px", opacity: 0.6 }}>
                  Joined: {selectedTeacher.dateJoined}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
