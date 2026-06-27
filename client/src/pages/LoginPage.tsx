import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/"); // Redirect to route index where App router directs based on role
    } catch (err) {
      // Error is stored inside AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: "relative" }}>
      {/* Top Right Theme Toggle */}
      <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
        <button 
          type="button" 
          className="theme-toggle-btn" 
          onClick={handleThemeToggle}
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome</h2>
          <p>Login to access your dashboard</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-field-container">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control password-input"
                placeholder="* * * * *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
