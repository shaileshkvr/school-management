import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface ClassLed {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  employeeId: string;
  group: string;
  gender: string;
  user: {
    email: string;
  };
  classesLed: ClassLed[];
}

export const ManageTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await api.get("/admin/teachers");
        setTeachers(response.data);
      } catch (err) {
        console.error("Failed to load teachers list:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  return (
    <DashboardLayout title="Manage Teachers">
      <div className="page-header">
        <h3>Teachers Directory</h3>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading teachers list...</h3>
        </div>
      ) : teachers.length === 0 ? (
        <div className="empty-state">
          <p>No teachers registered yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Email Address</th>
                <th>Academic Group</th>
                <th>Gender</th>
                <th>Assigned Classes</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td style={{ fontWeight: 600 }}>{teacher.employeeId}</td>
                  <td>{teacher.user.email}</td>
                  <td>
                    <span style={{ textTransform: "capitalize" }}>
                      {teacher.group.toLowerCase().replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{teacher.gender.toLowerCase()}</td>
                  <td>
                    {teacher.classesLed.length === 0 ? (
                      <span style={{ color: "var(--text-secondary)" }}>None</span>
                    ) : (
                      teacher.classesLed.map((c) => c.name).join(", ")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
