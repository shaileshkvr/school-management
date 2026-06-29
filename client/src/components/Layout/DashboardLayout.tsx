import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header />
        <main style={{ flex: 1, overflowY: "auto", padding: "0 1.25rem 1.25rem 1.25rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
};
