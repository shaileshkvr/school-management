import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentsPage } from "./pages/admin/StudentsPage";
import { TeachersPage } from "./pages/admin/TeachersPage";
import { NoticesPage } from "./pages/admin/NoticesPage";
import { CreateNoticePage } from "./pages/admin/CreateNoticePage";

function App() {
  // Set default theme attribute on mount
  useEffect(() => {
    if (!document.body.getAttribute("data-theme")) {
      document.body.setAttribute("data-theme", "charcoal");
    }
  }, []);

  return (
    <AuthProvider>
      <ConfirmProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <StudentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <TeachersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <NoticesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notices/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <NoticesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notices/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <CreateNoticePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;
