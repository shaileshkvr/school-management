import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface Student {
  id: string;
  admissionNo: string;
  user: {
    email: string;
  };
}

interface ClassItem {
  id: string;
  name: string;
  students: Student[];
}

interface SubjectItem {
  id: string;
  name: string;
}

export const EnterScores: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [examName, setExamName] = useState("UT1");
  const [maxScore, setMaxScore] = useState(50);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [scores, setScores] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          api.get("/teacher/classes"),
          api.get("/teacher/subjects"),
        ]);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data[0].id);
        }
        if (subjectsRes.data.length > 0) {
          setSelectedSubjectId(subjectsRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
        setError("Failed to load classes or subjects registry.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    const foundClass = classes.find((c) => c.id === selectedClassId);
    if (foundClass) {
      setStudents(foundClass.students);
      const initialScores: Record<string, string> = {};
      foundClass.students.forEach((s) => {
        initialScores[s.id] = "";
      });
      setScores(initialScores);
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    // Automatically toggle maxScore helper for exam types
    if (examName === "UT1" || examName === "UT2") {
      setMaxScore(50);
    } else if (examName === "Half-yearly" || examName === "Term-end") {
      setMaxScore(100);
    }
  }, [examName]);

  const handleScoreChange = (studentId: string, val: string) => {
    setScores((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate scores are entered and within limits
    const postScores: Array<{ studentId: string; score: number }> = [];
    for (const student of students) {
      const rawScore = scores[student.id];
      if (rawScore === undefined || rawScore === "") {
        setError(`Please enter a score for student: ${student.admissionNo}`);
        setSubmitLoading(false);
        return;
      }
      
      const numScore = parseFloat(rawScore);
      if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
        setError(`Invalid score for ${student.admissionNo}. Must be between 0 and ${maxScore}.`);
        setSubmitLoading(false);
        return;
      }
      postScores.push({ studentId: student.id, score: numScore });
    }

    try {
      await api.post("/teacher/scores", {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        examName,
        maxScore,
        date: new Date(date).toISOString(),
        scores: postScores,
      });

      setSuccessMessage("Exam scores saved successfully!");
      // Reset scores input
      const resetScores: Record<string, string> = {};
      students.forEach((s) => {
        resetScores[s.id] = "";
      });
      setScores(resetScores);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to save exam scores:", err);
      setError(err.response?.data?.error || "Failed to submit exam scores.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <DashboardLayout title="Enter Exam Scores">
      {successMessage && <div className="toast-success">{successMessage}</div>}

      {loading ? (
        <div className="empty-state">
          <h3>Retrieving academic configurations...</h3>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSaveScores}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Select Class</label>
                <select
                  className="form-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Subject</label>
                <select
                  className="form-select"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Exam Session</label>
                <select
                  className="form-select"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  required
                >
                  <option value="UT1">UT1</option>
                  <option value="Half-yearly">Half-yearly</option>
                  <option value="UT2">UT2</option>
                  <option value="Term-end">Term-end</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Max Marks</label>
                <input
                  type="number"
                  className="form-control"
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                  min={1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exam Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>{error}</div>}

            {students.length === 0 ? (
              <div className="empty-state">
                <p>No students enrolled in the selected class.</p>
              </div>
            ) : (
              <div>
                <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Admission No</th>
                        <th>Student Email</th>
                        <th>Obtained Score (Max {maxScore})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td style={{ fontWeight: 600 }}>{student.admissionNo}</td>
                          <td>{student.user.email}</td>
                          <td>
                            <input
                              type="number"
                              className="score-input"
                              value={scores[student.id] ?? ""}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              placeholder="Score"
                              min={0}
                              max={maxScore}
                              step="0.5"
                              required
                            />
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
                    {submitLoading ? "Submitting Marks..." : "Publish Exam Marks"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
