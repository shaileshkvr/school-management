import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { LoginPage } from "./pages/LoginPage.js";
import { AdminDashboard } from "./pages/AdminDashboard.js";
import { TeacherDashboard } from "./pages/TeacherDashboard.js";
import { StudentDashboard } from "./pages/StudentDashboard.js";

// Page loader component
const PageLoader: React.FC = () => (
  <div style={{
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    height: "100vh", 
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-secondary)"
  }}>
    <h3>Loading session...</h3>
  </div>
);

// Route wrapper protecting routes based on roles
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: ("ADMIN" | "TEACHER" | "STUDENT")[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// Main index router determining target dashboard from user credentials
const DashboardIndex: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "TEACHER":
      return <Navigate to="/teacher" replace />;
    case "STUDENT":
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Dynamic Entry point */}
        <Route path="/" element={<DashboardIndex />} />

        {/* Role Guarded Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
