import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout.js";
import api from "../../utils/api.js";

interface GradeItem {
  id: string;
  examName: string;
  score: string;
  maxScore: string;
  date: string;
  subject: {
    name: string;
  };
}

export const MyGrades: React.FC = () => {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await api.get("/student/grades");
        setGrades(response.data);
      } catch (err) {
        console.error("Failed to load my grades:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  // Group grades by exam session name
  const groupedGrades = grades.reduce<Record<string, GradeItem[]>>((acc, item) => {
    if (!acc[item.examName]) {
      acc[item.examName] = [];
    }
    acc[item.examName].push(item);
    return acc;
  }, {});

  const getOverallStats = () => {
    if (grades.length === 0) return 0;
    const totalPercentage = grades.reduce((sum, item) => {
      const score = parseFloat(item.score);
      const max = parseFloat(item.maxScore);
      return sum + (score / max) * 100;
    }, 0);
    return Math.round((totalPercentage / grades.length) * 10) / 10;
  };

  const overallAvg = getOverallStats();

  return (
    <DashboardLayout title="My Grades">
      <div className="page-header">
        <h3>My Exam Scorecard</h3>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Retrieving exam scorecard...</h3>
        </div>
      ) : grades.length === 0 ? (
        <div className="empty-state">
          <p>No exam scorecards posted for your profile yet.</p>
        </div>
      ) : (
        <div>
          <div className="summary-bar">
            <div className="summary-item">
              <span className="label">Cumulative Academic Average</span>
              <span className="value" style={{ color: "var(--color-brand)" }}>
                {overallAvg}%
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Total Exam Papers Graded</span>
              <span className="value">{grades.length} papers</span>
            </div>
          </div>

          {Object.entries(groupedGrades).map(([examName, items]) => (
            <div key={examName} className="exam-section card" style={{ marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-brand)", marginBottom: "1rem", borderBottom: "2px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                {examName} Examination
              </h4>

              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Academic Subject</th>
                      <th>Obtained Marks</th>
                      <th>Maximum Marks</th>
                      <th>Percentage Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const scoreVal = parseFloat(item.score);
                      const maxVal = parseFloat(item.maxScore);
                      const percentage = Math.round((scoreVal / maxVal) * 1000) / 10;

                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.subject.name}</td>
                          <td>{scoreVal}</td>
                          <td>{maxVal}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: percentage >= 75 ? "var(--color-success)" : "var(--text-primary)" }}>
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
