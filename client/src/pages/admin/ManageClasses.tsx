import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";
import { Plus } from "lucide-react";

interface Teacher {
  id: string;
  employeeId: string;
  user: {
    email: string;
  };
}

interface ClassData {
  id: string;
  name: string;
  teacherId: string | null;
  teacher: Teacher | null;
  _count: {
    students: number;
  };
}

export const ManageClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [classesRes, teachersRes] = await Promise.all([
        api.get("/admin/classes"),
        api.get("/admin/teachers"),
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error("Failed to load classes or teachers:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!newClassName.trim()) {
      setSubmitError("Class name is required.");
      return;
    }

    try {
      await api.post("/admin/classes", {
        name: newClassName.trim(),
        teacherId: selectedTeacherId || null,
      });

      setSuccessMessage("Class created successfully!");
      setNewClassName("");
      setSelectedTeacherId("");
      setIsModalOpen(false);
      fetchData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to create class:", err);
      setSubmitError(err.response?.data?.error || "Failed to create class.");
    }
  };

  return (
    <DashboardLayout title="Manage Classes">
      {successMessage && <div className="toast-success">{successMessage}</div>}

      <div className="page-header">
        <h3>Classrooms List</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} style={{ marginRight: "0.25rem" }} />
          New Class
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading classes data...</h3>
        </div>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <p>No classes registered yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Class Teacher</th>
                <th>Enrolled Students</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td style={{ fontWeight: 600 }}>{cls.name}</td>
                  <td>{cls.teacher ? `${cls.teacher.user.email} (${cls.teacher.employeeId})` : "—"}</td>
                  <td>{cls._count.students} students</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Class</h3>
            {submitError && <div className="alert alert-danger">{submitError}</div>}
            
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label className="form-label">Class Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Class 5-A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Class Teacher (Optional)</label>
                <select
                  className="form-select"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">No Teacher Assigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.email} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ width: "auto" }}>
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
