import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { LoginPage } from "./pages/LoginPage.js";
import { AdminDashboard } from "./pages/AdminDashboard.js";
import { TeacherDashboard } from "./pages/TeacherDashboard.js";
import { StudentDashboard } from "./pages/StudentDashboard.js";

// Admin Subpages
import { ManageClasses } from "./pages/admin/ManageClasses.js";
import { ManageTeachers } from "./pages/admin/ManageTeachers.js";
import { ManageStudents } from "./pages/admin/ManageStudents.js";
import { FeesRegistry } from "./pages/admin/FeesRegistry.js";
import { PostAnnouncements } from "./pages/admin/PostAnnouncements.js";

// Teacher Subpages
import { MarkAttendance } from "./pages/teacher/MarkAttendance.js";
import { EnterScores } from "./pages/teacher/EnterScores.js";
import { ClassNoticeBoard } from "./pages/teacher/ClassNoticeBoard.js";

// Student Subpages
import { MyAttendance } from "./pages/student/MyAttendance.js";
import { MyGrades } from "./pages/student/MyGrades.js";
import { MyFees } from "./pages/student/MyFees.js";

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
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <FeesRegistry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PostAnnouncements />
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
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/grades"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <EnterScores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/notices"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ClassNoticeBoard />
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
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyFees />
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
