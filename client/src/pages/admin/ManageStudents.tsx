import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";
import { Filter } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
}

interface Student {
  id: string;
  admissionNo: string;
  gender: string;
  user: {
    email: string;
  };
  class: {
    name: string;
  };
}

export const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await api.get("/admin/classes");
        setClasses(response.data);
      } catch (err) {
        console.error("Failed to load class filters:", err);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const url = selectedClassId ? `/admin/students?classId=${selectedClassId}` : "/admin/students";
        const response = await api.get(url);
        setStudents(response.data);
      } catch (err) {
        console.error("Failed to load students list:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [selectedClassId]);

  return (
    <DashboardLayout title="Manage Students">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h3>Students Roster</h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={18} style={{ color: "var(--text-secondary)" }} />
          <select
            className="form-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading students list...</h3>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p>No students enrolled in this selection.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Email Address</th>
                <th>Enrolled Class</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 600 }}>{student.admissionNo}</td>
                  <td>{student.user.email}</td>
                  <td>{student.class.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{student.gender.toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
