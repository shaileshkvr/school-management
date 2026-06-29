import React, { useState, useEffect, useRef } from "react";
import { Users, Star, X, ChevronDown, BookOpen } from "lucide-react";

interface Student {
  name: string;
  section: string;
  avgRating: number;
  attendance: number;
  feeStatus: "PAID" | "UNPAID" | "PARTIAL";
  address: string;
  contact: string;
}

interface ClassData {
  id: string;
  name: string;
  teachers: string[];
  students: Student[];
}

const mockClasses: ClassData[] = [
  {
    id: "c1",
    name: "Class 1",
    teachers: ["Mr. Suresh Kumar", "Mrs. Laxmi Das"],
    students: [
      { name: "Aarav Sharma", section: "A", avgRating: 4.5, attendance: 92, feeStatus: "PAID", address: "5, Salt Lake, Kolkata", contact: "+91 98000 11111" },
      { name: "Bhavna Patel", section: "B", avgRating: 4.1, attendance: 88, feeStatus: "PARTIAL", address: "14, S.G. Highway, Ahmedabad", contact: "+91 97000 22222" },
    ],
  },
  {
    id: "c2",
    name: "Class 2",
    teachers: ["Mr. Rajesh Patel", "Mrs. Anita Shah"],
    students: [
      { name: "Chirag Gandhi", section: "A", avgRating: 4.3, attendance: 90, feeStatus: "PAID", address: "23, Ring Road, Surat", contact: "+91 96000 33333" },
      { name: "Divya Kapoor", section: "B", avgRating: 4.6, attendance: 94, feeStatus: "UNPAID", address: "88, Sector 4, Noida", contact: "+91 95000 44444" },
    ],
  },
  {
    id: "c3",
    name: "Class 3",
    teachers: ["Mr. Vikram Singh", "Mrs. Kavita Roy"],
    students: [
      { name: "Esha Gupta", section: "A", avgRating: 4.2, attendance: 85, feeStatus: "PARTIAL", address: "10, Shivaji Nagar, Pune", contact: "+91 94000 55555" },
      { name: "Farhan Khan", section: "B", avgRating: 3.8, attendance: 73, feeStatus: "UNPAID", address: "44, Juhu Lane, Mumbai", contact: "+91 93000 66666" },
    ],
  },
  {
    id: "c4",
    name: "Class 4",
    teachers: ["Mr. Nitin Gupta", "Mrs. Ritu Sen"],
    students: [
      { name: "Gaurav Sen", section: "A", avgRating: 4.7, attendance: 97, feeStatus: "PAID", address: "12, Park Street, Kolkata", contact: "+91 92000 77777" },
      { name: "Harsh Mehta", section: "B", avgRating: 4.0, attendance: 82, feeStatus: "PAID", address: "101, G.N. Road, Mumbai", contact: "+91 91000 88888" },
    ],
  },
  {
    id: "c5",
    name: "Class 5",
    teachers: ["Mr. Sanjay Sen", "Mrs. Sunita Rao"],
    students: [
      { name: "Ishita Rao", section: "A", avgRating: 4.8, attendance: 95, feeStatus: "PAID", address: "55, Indiranagar, Bangalore", contact: "+91 90000 99999" },
      { name: "Jatin Verma", section: "B", avgRating: 3.9, attendance: 76, feeStatus: "UNPAID", address: "15, GK-2, New Delhi", contact: "+91 89000 11111" },
    ],
  },
  {
    id: "c6",
    name: "Class 6",
    teachers: ["Mr. Manoj Nair", "Mrs. Deepa Iyer"],
    students: [
      { name: "Karan Johar", section: "A", avgRating: 4.4, attendance: 91, feeStatus: "PARTIAL", address: "2, Carter Road, Mumbai", contact: "+91 88000 22222" },
      { name: "Lata Mangeshkar", section: "B", avgRating: 4.9, attendance: 99, feeStatus: "PAID", address: "Peddar Road, Mumbai", contact: "+91 87000 33333" },
    ],
  },
  {
    id: "c7",
    name: "Class 7",
    teachers: ["Mr. Anil Mehta", "Mrs. Preeti Bhat"],
    students: [
      { name: "Manish Malhotra", section: "A", avgRating: 4.1, attendance: 86, feeStatus: "PAID", address: "78, Juhu Scheme, Mumbai", contact: "+91 86000 44444" },
      { name: "Nisha Rawal", section: "B", avgRating: 3.7, attendance: 68, feeStatus: "UNPAID", address: "12, Ring Road, Delhi", contact: "+91 85000 55555" },
    ],
  },
  {
    id: "c8",
    name: "Class 8",
    teachers: ["Mr. Amit Sharma", "Mrs. Priya Verma"],
    students: [
      { name: "Aditi Rao", section: "A", avgRating: 4.8, attendance: 96, feeStatus: "PAID", address: "12, Park Street, Kolkata", contact: "+91 98765 43210" },
      { name: "Aman Gupta", section: "B", avgRating: 3.9, attendance: 72, feeStatus: "UNPAID", address: "45, G.N. Road, Mumbai", contact: "+91 98300 12345" },
      { name: "Devansh Mehta", section: "A", avgRating: 4.5, attendance: 88, feeStatus: "PARTIAL", address: "88, Ring Road, Delhi", contact: "+91 98111 22233" },
      { name: "Ishaan Sen", section: "B", avgRating: 4.2, attendance: 91, feeStatus: "PAID", address: "14/B, Salt Lake, Kolkata", contact: "+91 98366 77788" },
      { name: "Meera Nair", section: "A", avgRating: 4.7, attendance: 95, feeStatus: "PAID", address: "23, Marine Drive, Kochi", contact: "+91 99955 88877" },
      { name: "Rahul Deshmukh", section: "B", avgRating: 3.5, attendance: 78, feeStatus: "UNPAID", address: "10, Shivaji Marg, Pune", contact: "+91 90044 55566" },
      { name: "Sanya Kapoor", section: "A", avgRating: 4.6, attendance: 93, feeStatus: "PARTIAL", address: "72, Sector 15, Noida", contact: "+91 98999 11100" },
    ],
  },
  {
    id: "c9",
    name: "Class 9",
    teachers: ["Mr. Rajesh Iyer", "Ms. Shalini Gupta"],
    students: [
      { name: "Arjun Reddy", section: "A", avgRating: 4.4, attendance: 89, feeStatus: "PAID", address: "55, Jubilee Hills, Hyderabad", contact: "+91 99888 77766" },
      { name: "Kunal Singhal", section: "B", avgRating: 3.8, attendance: 84, feeStatus: "PARTIAL", address: "101, Mall Road, Shimla", contact: "+91 94180 55544" },
      { name: "Rohan Das", section: "A", avgRating: 4.1, attendance: 90, feeStatus: "UNPAID", address: "2B, Ballygunge Circular, Kolkata", contact: "+91 98312 99900" },
      { name: "Sneha Patel", section: "B", avgRating: 4.9, attendance: 98, feeStatus: "PAID", address: "15, S.G. Highway, Ahmedabad", contact: "+91 97240 12345" },
    ],
  },
  {
    id: "c10",
    name: "Class 10",
    teachers: ["Mr. Sanjay Joshi", "Mrs. Neha Kulkarni"],
    students: [
      { name: "Aditya Bhat", section: "A", avgRating: 4.6, attendance: 94, feeStatus: "PAID", address: "40, Prabhat Road, Pune", contact: "+91 98220 11122" },
      { name: "Kriti Sanon", section: "B", avgRating: 4.3, attendance: 87, feeStatus: "PARTIAL", address: "89, Bandra Reclamation, Mumbai", contact: "+91 98200 44433" },
      { name: "Nikhil Chawla", section: "A", avgRating: 3.7, attendance: 70, feeStatus: "UNPAID", address: "12, GK-1, New Delhi", contact: "+91 98100 88877" },
    ],
  },
  {
    id: "c11_sci",
    name: "Class 11 (Science)",
    teachers: ["Dr. Vikram Sarabhai", "Mrs. Radhika Apte"],
    students: [
      { name: "Kabir Thapar", section: "Sci", avgRating: 4.7, attendance: 92, feeStatus: "PAID", address: "12A, Carter Road, Mumbai", contact: "+91 98199 88877" },
      { name: "Naina Talwar", section: "Sci", avgRating: 4.9, attendance: 99, feeStatus: "PAID", address: "45, Golf Links, New Delhi", contact: "+91 98111 66677" },
    ],
  },
  {
    id: "c11_com",
    name: "Class 11 (Commerce)",
    teachers: ["Mr. Harshad Mehta", "Ms. Sucheta Dalal"],
    students: [
      { name: "Avi Bagga", section: "Com", avgRating: 4.0, attendance: 85, feeStatus: "PARTIAL", address: "23, Peddar Road, Mumbai", contact: "+91 98200 99988" },
      { name: "Aditi Mehra", section: "Com", avgRating: 4.2, attendance: 89, feeStatus: "PAID", address: "8, Alipore, Kolkata", contact: "+91 98300 44455" },
    ],
  },
  {
    id: "c11_art",
    name: "Class 11 (Arts)",
    teachers: ["Mr. Rabindranath Tagore", "Mrs. Amrita Sher-Gil"],
    students: [
      { name: "Devdas Mukherjee", section: "Arts", avgRating: 4.1, attendance: 78, feeStatus: "PARTIAL", address: "14, Alipore Circular, Kolkata", contact: "+91 98300 55566" },
      { name: "Paro Chakraborty", section: "Arts", avgRating: 4.6, attendance: 94, feeStatus: "PAID", address: "7, Howrah Road, Kolkata", contact: "+91 98300 77788" },
    ],
  },
  {
    id: "c12_sci",
    name: "Class 12 (Science)",
    teachers: ["Dr. C.V. Raman", "Mrs. Sudha Murty"],
    students: [
      { name: "Aryan Khan", section: "Sci", avgRating: 3.6, attendance: 65, feeStatus: "UNPAID", address: "Mannat, Bandra, Mumbai", contact: "+91 98200 11111" },
      { name: "Jahnvi Kapoor", section: "Sci", avgRating: 4.1, attendance: 82, feeStatus: "PAID", address: "Juhu Vile Parle, Mumbai", contact: "+91 98200 22222" },
    ],
  },
  {
    id: "c12_com",
    name: "Class 12 (Commerce)",
    teachers: ["Mr. Ratan Tata", "Ms. Kiran Shaw"],
    students: [
      { name: "Ranbir Kapoor", section: "Com", avgRating: 4.3, attendance: 88, feeStatus: "PAID", address: "Pali Hill, Bandra, Mumbai", contact: "+91 98200 33333" },
      { name: "Alia Bhatt", section: "Com", avgRating: 4.8, attendance: 97, feeStatus: "PAID", address: "Juhu Road, Mumbai", contact: "+91 98200 44444" },
    ],
  },
  {
    id: "c12_art",
    name: "Class 12 (Arts)",
    teachers: ["Mr. Satyajit Ray", "Mrs. Arundhati Roy"],
    students: [
      { name: "Apu Roy", section: "Arts", avgRating: 4.5, attendance: 91, feeStatus: "PAID", address: "19, N.S.C. Bose Road, Kolkata", contact: "+91 98322 11122" },
      { name: "Durga Roy", section: "Arts", avgRating: 4.7, attendance: 95, feeStatus: "PAID", address: "19, N.S.C. Bose Road, Kolkata", contact: "+91 98322 33344" },
    ],
  },
];

export const StudentsPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [feeFilter, setFeeFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("ALL");

  const classSelectorRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (classSelectorRef.current && !classSelectorRef.current.contains(e.target as Node)) {
        setShowClassDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClassSelect = (cls: ClassData) => {
    setSelectedClass(cls);
    setSelectedStudent(null); // Reset detail panel
    setShowClassDropdown(false); // Close dropdown
  };

  // Group classes by section category
  const primaryClasses = mockClasses.slice(0, 5); // Class 1-5
  const secondaryClasses = mockClasses.slice(5, 10); // Class 6-10
  const seniorSecondaryClasses = mockClasses.slice(10); // Class 11-12 Sci/Com/Art

  // Sort and filter students alphabetically
  const getFilteredStudents = () => {
    if (!selectedClass) return [];
    
    return selectedClass.students
      .filter((s) => {
        // Name Search
        const matchesSearch = s.name.toLowerCase().includes(searchText.toLowerCase());
        
        // Fee Status
        const matchesFee = feeFilter === "ALL" || s.feeStatus === feeFilter;
        
        // Average Rating
        const matchesRating =
          ratingFilter === "ALL" ||
          (ratingFilter === "HIGH" && s.avgRating >= 4.5) ||
          (ratingFilter === "LOW" && s.avgRating < 4.0) ||
          (ratingFilter === "MID" && s.avgRating >= 4.0 && s.avgRating < 4.5);

        // Attendance
        const matchesAttendance =
          attendanceFilter === "ALL" ||
          (attendanceFilter === "LOW" && s.attendance < 75) ||
          (attendanceFilter === "OK" && s.attendance >= 75);

        return matchesSearch && matchesFee && matchesRating && matchesAttendance;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredStudents = getFilteredStudents();

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
            <span>{selectedClass ? `${selectedClass.name} Register` : "Select Class..."}</span>
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
                      key={cls.id}
                      onClick={() => handleClassSelect(cls)}
                      className="sidebar-link-hover"
                      style={{
                        padding: "8px 10px", borderRadius: "6px", border: "none", color: "inherit", background: "none", textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 500
                      }}
                    >
                      {cls.name}
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
                      key={cls.id}
                      onClick={() => handleClassSelect(cls)}
                      className="sidebar-link-hover"
                      style={{
                        padding: "8px 10px", borderRadius: "6px", border: "none", color: "inherit", background: "none", textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 500
                      }}
                    >
                      {cls.name}
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
                      key={cls.id}
                      onClick={() => handleClassSelect(cls)}
                      className="sidebar-link-hover"
                      style={{
                        padding: "8px 10px", borderRadius: "6px", border: "none", color: "inherit", background: "none", textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 500
                      }}
                    >
                      {cls.name}
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
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{selectedClass.name} Register</h3>
                <div style={{ fontSize: "13px", color: "var(--text-glass-muted)", marginTop: "4px" }}>
                  <strong>Class Teachers:</strong> {selectedClass.teachers.join(" & ")}
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
                  Class: {selectedClass.name} - Section {selectedStudent.section}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Contact Number</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedStudent.contact}</div>
                </div>

                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-glass-muted)" }}>Home Address</div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>{selectedStudent.address}</div>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "10px", marginTop: "4px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-glass-muted)", fontStyle: "italic", textAlign: "center" }}>
                    Personal records, grade lists, and attendance calendars are left blank for now.
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
