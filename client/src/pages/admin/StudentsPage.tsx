import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Users, Star, X, ChevronDown, BookOpen } from "lucide-react";

const API_URL = "http://localhost:9091/api";

interface Student {
  id: string;
  name: string;
  section: string;
  avgRating: number;
  attendance: number;
  feeStatus: "PAID" | "UNPAID" | "PARTIAL";
  address: string;
  contact: string;
  admissionNo: string;
  parentName: string;
  parentPhone: string;
  gender: string;
  birthDate: string;
  classId: string;
}

interface CombinedClass {
  displayName: string;
  originalClassIds: string[];
  teachers: string[];
  totalStudents: number;
}

interface FeeResponse {
  id: string;
  studentId: string;
  amount: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "PARTIAL";
}

interface ClassResponse {
  id: string;
  name: string;
  teacherId: string | null;
  teacher: {
    user: {
      email: string;
    };
  } | null;
  _count?: {
    students: number;
  };
}

interface StudentResponse {
  id: string;
  userId: string;
  classId: string;
  admissionNo: string;
  parentName: string;
  parentPhone: string;
  gender: string;
  birthDate: string;
  user?: {
    email: string;
  };
  class?: {
    name: string;
  };
}

/**
 * Parses a student's full name from their email address format (e.g. first.lastX@student.school.com -> First Last)
 */
const getStudentNameFromEmail = (email: string): string => {
  if (email === "student@school.com") return "Demo Student";
  const localPart = email.split("@")[0];
  const cleanPart = localPart.replace(/\d+$/, ""); // Remove trailing numerical values
  const nameParts = cleanPart.split(".");
  return nameParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
};

/**
 * Parses a teacher's full name from their email address format (e.g. first.last@school.com -> First Last)
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

/**
 * Normalizes section names to combine sections (e.g. Grade 8-A -> Grade 8, but Grade 11-Science -> Grade 11 (Science))
 */
const getBaseClassName = (name: string): string => {
  const streamMatch = name.match(/Grade (11|12)-(Science|Commerce|Arts)/);
  if (streamMatch) {
    return `Grade ${streamMatch[1]} (${streamMatch[2]})`;
  }
  const sectionMatch = name.match(/Grade (\d+)-([A-B])/);
  if (sectionMatch) {
    return `Grade ${sectionMatch[1]}`;
  }
  return name;
};

/**
 * Extracts the numerical grade indicator from a class name string (e.g. Grade 8 -> 8)
 */
const getGradeNumber = (displayName: string): number => {
  const match = displayName.match(/Grade (\d+)/);
  return match ? parseInt(match[1]) : 0;
};

export const StudentsPage: React.FC = () => {
  // DB states
  const [classes, setClasses] = useState<CombinedClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Active selections
  const [selectedClass, setSelectedClass] = useState<CombinedClass | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // UI states
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [feeFilter, setFeeFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("ALL");

  const classSelectorRef = useRef<HTMLDivElement>(null);

  /**
   * Fetches database records for classes, students, and payment fees on component mount
   */
  useEffect(() => {
    const fetchDatabaseRecords = async () => {
      try {
        setLoading(true);
        const [resClasses, resStudents, resFees] = await Promise.all([
          axios.get(`${API_URL}/admin/classes`),
          axios.get(`${API_URL}/admin/students`),
          axios.get(`${API_URL}/admin/fees`),
        ]);

        // Build a dictionary lookup for fee statuses
        const feesLookup: Record<string, "PAID" | "UNPAID" | "PARTIAL"> = {};
        resFees.data.forEach((f: FeeResponse) => {
          feesLookup[f.studentId] = f.status;
        });

        // Group section classes into combined cards
        const classGroups: Record<string, CombinedClass> = {};
        resClasses.data.forEach((c: ClassResponse) => {
          const baseName = getBaseClassName(c.name);
          if (!classGroups[baseName]) {
            classGroups[baseName] = {
              displayName: baseName,
              originalClassIds: [],
              teachers: [],
              totalStudents: 0,
            };
          }
          classGroups[baseName].originalClassIds.push(c.id);
          classGroups[baseName].totalStudents += c._count?.students || 0;
          
          if (c.teacher?.user?.email) {
            const name = getTeacherNameFromEmail(c.teacher.user.email);
            if (!classGroups[baseName].teachers.includes(name)) {
              classGroups[baseName].teachers.push(name);
            }
          }
        });

        const sortedClasses = Object.values(classGroups).sort((a, b) => {
          const numA = getGradeNumber(a.displayName);
          const numB = getGradeNumber(b.displayName);
          if (numA !== numB) return numA - numB;
          return a.displayName.localeCompare(b.displayName);
        });

        // Map and project database student records, generating deterministic scores for demo stability
        const mappedStudents: Student[] = resStudents.data.map((s: StudentResponse) => {
          const attendanceVal = 70 + (parseInt(s.id.slice(0, 4), 16) % 31);
          const ratingVal = 3.0 + ((parseInt(s.id.slice(4, 8), 16) % 21) / 10);
          
          return {
            id: s.id,
            name: getStudentNameFromEmail(s.user?.email || "student@school.com"),
            section: s.class?.name.split("-")[1] || "A",
            avgRating: ratingVal,
            attendance: attendanceVal,
            feeStatus: feesLookup[s.id] || "UNPAID",
            address: "West Bengal, India",
            contact: s.parentPhone || "+91 98300 12345",
            admissionNo: s.admissionNo,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            gender: s.gender,
            birthDate: new Date(s.birthDate).toLocaleDateString(),
            classId: s.classId,
          };
        });

        setClasses(sortedClasses);
        setStudents(mappedStudents);
      } catch (err) {
        console.error("Failed to retrieve students database registers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseRecords();
  }, []);

  /**
   * Closes the floating class list overlay dropdown if clicked outside of its container
   */
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (classSelectorRef.current && !classSelectorRef.current.contains(e.target as Node)) {
        setShowClassDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /**
   * Sets the active class register view and clears any student detail slideouts
   */
  const handleClassSelect = (cls: CombinedClass) => {
    setSelectedClass(cls);
    setSelectedStudent(null);
    setShowClassDropdown(false);
  };

  // Categorize classrooms for dropdown navigation
  const primaryClasses = classes.filter((c) => {
    const g = getGradeNumber(c.displayName);
    return g >= 1 && g <= 5;
  });

  const secondaryClasses = classes.filter((c) => {
    const g = getGradeNumber(c.displayName);
    return g >= 6 && g <= 10;
  });

  const seniorSecondaryClasses = classes.filter((c) => {
    const g = getGradeNumber(c.displayName);
    return g >= 11 && g <= 12;
  });

  /**
   * Filters and sorts students in the selected class based on search text, fee pill status, scores, and attendance alerts
   */
  const getFilteredStudents = () => {
    if (!selectedClass) return [];
    
    return students
      .filter((s) => {
        const matchesClass = selectedClass.originalClassIds.includes(s.classId);
        if (!matchesClass) return false;

        const matchesSearch = s.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesFee = feeFilter === "ALL" || s.feeStatus === feeFilter;
        
        const matchesRating =
          ratingFilter === "ALL" ||
          (ratingFilter === "HIGH" && s.avgRating >= 4.5) ||
          (ratingFilter === "LOW" && s.avgRating < 4.0) ||
          (ratingFilter === "MID" && s.avgRating >= 4.0 && s.avgRating < 4.5);

        const matchesAttendance =
          attendanceFilter === "ALL" ||
          (attendanceFilter === "LOW" && s.attendance < 75) ||
          (attendanceFilter === "OK" && s.attendance >= 75);

        return matchesSearch && matchesFee && matchesRating && matchesAttendance;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredStudents = getFilteredStudents();

  /**
   * Determines styling parameters for the Fee Status badge columns
   */
  const getFeeBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return { bg: "rgba(52, 199, 89, 0.15)", text: "#34c759" };
      case "UNPAID":
        return { bg: "rgba(255, 59, 48, 0.15)", text: "#ff3b30" };
      default:
        return { bg: "rgba(255, 159, 10, 0.15)", text: "#ff9f0a" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--text-glass-muted)" }}>
        <h3>Loading student records from the database...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      {/* Header bar with unified select button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ color: "var(--text-canvas)", fontSize: "1.8rem", fontWeight: "700" }}>Students Administration</h2>
          <p style={{ color: "var(--text-canvas-muted, #7c7c82)", fontSize: "0.95rem", marginTop: "2px" }}>
            Manage registers, student performance rating records, and fee logs
          </p>
        </div>

        {/* Unified Class Selector Dropdown */}
        <div ref={classSelectorRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowClassDropdown(!showClassDropdown)}
            className="glass-panel"
            style={{
              padding: "10px 18px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--glass-bg)",
              color: "var(--text-glass)",
              border: "1px solid var(--glass-border)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "var(--glass-shadow)",
              transition: "var(--transition-smooth)",
            }}
          >
            <BookOpen size={16} />
            <span>{selectedClass ? `${selectedClass.displayName} Register` : "Select Class..."}</span>
            <ChevronDown size={14} style={{ transform: showClassDropdown ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>

          {/* Large Categorized Glass Overlay Menu */}
          {showClassDropdown && (
            <div
              className="glass-panel"
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                width: "580px",
                padding: "1.25rem",
                zIndex: 250,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.2fr",
                gap: "1.25rem",
                background: "var(--glass-bg)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--glass-shadow)",
                color: "var(--text-glass)",
                borderRadius: "16px",
              }}
            >
              {/* Primary Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--accent)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "4px" }}>
                  Primary (1-5)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {primaryClasses.map((cls) => (
                    <button
                      key={cls.displayName}
                      onClick={() => handleClassSelect(cls)}
                      className="sidebar-link-hover"
                      style={{
                        padding: "8px 10px", borderRadius: "6px", border: "none", color: "inherit", background: "none", textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 500
                      }}
                    >
                      {cls.displayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--accent)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "4px" }}>
                  Secondary (6-10)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {secondaryClasses.map((cls) => (
                    <button
                      key={cls.displayName}
                      onClick={() => handleClassSelect(cls)}
                      className="sidebar-link-hover"
                      style={{
                        padding: "8px 10px", borderRadius: "6px", border: "none", color: "inherit", background: "none", textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 500
                      }}
                    >
                      {cls.displayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Senior Secondary Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--accent)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "4px" }}>
                  Senior Sec (11-12)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {seniorSecondaryClasses.map((cls) => (
                    <button
                      key={cls.displayName}
                      onClick={() => handleClassSelect(cls)}
                      className="sidebar-link-hover"
                      style={{
                        padding: "8px 10px", borderRadius: "6px", border: "none", color: "inherit", background: "none", textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 500
                      }}
                    >
                      {cls.displayName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Class Panel or Empty Instruction State */}
      {selectedClass ? (
        <div style={{ display: "flex", gap: "1rem", position: "relative", alignItems: "flex-start" }}>
          {/* Main List Section */}
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", borderRadius: "14px" }}>
            {/* Header register info */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{selectedClass.displayName} Register</h3>
                <div style={{ fontSize: "13px", color: "var(--text-glass-muted)", marginTop: "4px" }}>
                  <strong>Class Teachers:</strong> {selectedClass.teachers.length > 0 ? selectedClass.teachers.join(" & ") : "Staff Member"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span className="glass-panel" style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "600", background: "rgba(255,255,255,0.04)" }}>
                  Combined Sections
                </span>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "1.25rem" }}>
              {/* Text Search */}
              <input
                type="text"
                placeholder="Search student name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="glass-panel glass-input"
                style={{
                  fontSize: "13px",
                  padding: "8px 12px",
                  flex: 1,
                  minWidth: "160px",
                  background: "var(--glass-bg)",
                  color: "var(--text-glass)",
                  border: "1px solid var(--glass-border)",
                  height: "38px"
                }}
              />

              {/* Fee Filter */}
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                className="glass-panel"
                style={{
                  fontSize: "13px",
                  padding: "0 10px",
                  height: "38px",
                  background: "var(--glass-bg)",
                  color: "var(--text-glass)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <option value="ALL">All Fees</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="UNPAID">Unpaid</option>
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="glass-panel"
                style={{
                  fontSize: "13px",
                  padding: "0 10px",
                  height: "38px",
                  background: "var(--glass-bg)",
                  color: "var(--text-glass)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <option value="ALL">All Ratings</option>
                <option value="HIGH">{"Highly Rated (>= 4.5)"}</option>
                <option value="MID">{"Average (4.0 - 4.5)"}</option>
                <option value="LOW">{"Alert / Low (< 4.0)"}</option>
              </select>

              {/* Attendance Filter */}
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="glass-panel"
                style={{
                  fontSize: "13px",
                  padding: "0 10px",
                  height: "38px",
                  background: "var(--glass-bg)",
                  color: "var(--text-glass)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <option value="ALL">All Attendance</option>
                <option value="OK">{"Regular (>= 75%)"}</option>
                <option value="LOW">{"Low Attendance Alert (< 75%)"}</option>
              </select>
            </div>

            {/* Students List Table */}
            {filteredStudents.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--glass-border)" }}>
                      <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Student Name</th>
                      <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Sec</th>
                      <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Avg Rating</th>
                      <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Attendance</th>
                      <th style={{ padding: "10px 8px", color: "var(--text-glass-muted)" }}>Fees Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, index) => {
                      const feeBadge = getFeeBadgeColor(s.feeStatus);
                      const isSelected = selectedStudent?.name === s.name;
                      return (
                        <tr
                          key={index}
                          onClick={() => setSelectedStudent(s)}
                          style={{
                            borderBottom: "1px solid var(--glass-border)",
                            cursor: "pointer",
                            background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                            transition: "background-color 0.2s"
                          }}
                          className="sidebar-link-hover"
                        >
                          <td style={{ padding: "12px 8px", fontWeight: "600" }}>{s.name}</td>
                          <td style={{ padding: "12px 8px" }}>{s.section}</td>
                          <td style={{ padding: "12px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Star size={14} fill="#eab308" color="#eab308" />
                              <span>{s.avgRating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{
                                width: "60px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden"
                              }}>
                                <div style={{
                                  width: `${s.attendance}%`, height: "100%",
                                  background: s.attendance < 75 ? "var(--error, #ff3b30)" : "var(--success, #34c759)"
                                }} />
                              </div>
                              <span style={{ fontSize: "12px", color: s.attendance < 75 ? "#ff3b30" : "inherit" }}>
                                {s.attendance}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 8px" }}>
                            <span style={{
                              fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "6px",
                              backgroundColor: feeBadge.bg, color: feeBadge.text
                            }}>
                              {s.feeStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-glass-muted)" }}>
                No students match the active search filters.
              </div>
            )}
          </div>

          {/* Student details Split panel overlay */}
          {selectedStudent && (
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
                  Student Details
                </h4>
                <button
                  onMouseEnter={() => setIsCloseHovered(true)}
                  onMouseLeave={() => setIsCloseHovered(false)}
                  onClick={() => setSelectedStudent(null)}
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

              {/* Detail parameters */}
              <div style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.75rem" }}>
                <div style={{ fontSize: "16px", fontWeight: "700" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-glass-muted)", marginTop: "4px" }}>
                  Class: {selectedClass.displayName} - Section {selectedStudent.section}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Admission Number</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedStudent.admissionNo}</div>
                </div>

                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Gender</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px", textTransform: "capitalize" }}>{selectedStudent.gender.toLowerCase()}</div>
                </div>

                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Birth Date</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedStudent.birthDate}</div>
                </div>

                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Parent Name</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedStudent.parentName}</div>
                </div>

                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Parent Phone</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedStudent.contact}</div>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "10px", marginTop: "4px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-glass-muted)", fontStyle: "italic", textAlign: "center" }}>
                    Full address and subject-wise grade logs are kept inside the primary db files.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "6rem 2rem", borderRadius: "14px", color: "var(--text-glass-muted)" }}>
          <div style={{ textAlign: "center" }}>
            <Users size={48} style={{ color: "var(--accent)", marginBottom: "1rem", opacity: 0.7 }} />
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-glass)" }}>Select a class to see details</h3>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>Click the dropdown button in the top right to select a register file.</p>
          </div>
        </div>
      )}
    </div>
  );
};
