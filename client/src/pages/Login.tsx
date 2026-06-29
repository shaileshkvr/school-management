import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      alert("Login credentials mismatch");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "2.5rem", width: "360px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 style={{ textAlign: "center", color: "#fff" }}>EduPortal Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="glass-input" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="glass-input" />
        <button type="submit" style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Sign In</button>
      </form>
    </div>
  );
};
