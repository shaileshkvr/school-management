import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface StudentAttendanceData {
  id: string;
  admissionNo: string;
  user: {
    email: string;
  };
  attendanceStatus: "PRESENT" | "ABSENT" | "LATE" | null;
}

interface ClassItem {
  id: string;
  name: string;
}

export const MarkAttendance: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [students, setStudents] = useState<StudentAttendanceData[]>([]);
  const [records, setRecords] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await api.get("/teacher/classes");
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClassId(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load classes list.");
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;
    
    async function fetchAttendance() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/teacher/attendance?classId=${selectedClassId}&date=${selectedDate}`);
        setStudents(response.data);
        
        // Initialize records map
        const initialRecords: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
        response.data.forEach((student: StudentAttendanceData) => {
          initialRecords[student.id] = student.attendanceStatus || "PRESENT"; // Default to Present
        });
        setRecords(initialRecords);
      } catch (err) {
        console.error("Failed to load attendance:", err);
        setError("Failed to load student attendance logs.");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccessMessage(null);

    const postRecords = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    try {
      await api.post("/teacher/attendance", {
        classId: selectedClassId,
        date: selectedDate,
        records: postRecords,
      });

      setSuccessMessage("Attendance recorded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setError("Failed to submit attendance logs.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <DashboardLayout title="Mark Attendance">
      {successMessage && <div className="toast-success">{successMessage}</div>}

      <div className="card" style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleSaveAttendance}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Class</label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={classes.length === 0}
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
              <label className="form-label">Attendance Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>{error}</div>}

          {loading ? (
            <div className="empty-state">
              <h3>Retrieving students...</h3>
            </div>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <p>No classes to mark attendance for.</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>No students enrolled in this class.</p>
            </div>
          ) : (
            <div>
              <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Admission No</th>
                      <th>Student Email</th>
                      <th>Mark Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 600 }}>{student.admissionNo}</td>
                        <td>{student.user.email}</td>
                        <td>
                          <div className="attendance-radios">
                            <label>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={records[student.id] === "PRESENT"}
                                onChange={() => handleStatusChange(student.id, "PRESENT")}
                              />
                              Present
                            </label>
                            <label>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={records[student.id] === "ABSENT"}
                                onChange={() => handleStatusChange(student.id, "ABSENT")}
                              />
                              Absent
                            </label>
                            <label>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={records[student.id] === "LATE"}
                                onChange={() => handleStatusChange(student.id, "LATE")}
                              />
                              Late
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "auto", paddingLeft: "2rem", paddingRight: "2rem" }}
                  disabled={submitLoading}
                >
                  {submitLoading ? "Saving Attendance..." : "Save Attendance Logs"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
};
