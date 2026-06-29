import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: ('ADMIN' | 'TEACHER' | 'STUDENT')[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>Verifying authentication session...</h3>
      </div>
    );
  }

  const activeRole = user?.role;

  if (!user || !activeRole || !allowedRoles.includes(activeRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
