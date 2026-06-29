import React from "react";

export const AdminDashboard: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ color: "var(--text-canvas)" }}>Admin Console</h2>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--accent)" }}>Total Students</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>1,284</p>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Active Registrations</span>
        </div>
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--accent)" }}>Faculties</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>94</p>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Approved Teachers</span>
        </div>
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ color: "var(--accent)" }}>Notice Board</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0" }}>12</p>
          <span style={{ fontSize: "11px", color: "var(--text-glass-muted)" }}>Global Alerts</span>
        </div>
      </div>
    </div>
  );
};
