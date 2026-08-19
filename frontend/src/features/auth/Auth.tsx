import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestTab, setSuggestTab] = useState<"login" | "signup" | null>(null);

  const navigate = useNavigate();

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuggestTab(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuggestTab(null);

    // Validate password only on Sign Up
    if (activeTab === "signup") {
      if (password.length < 8) {
        setErrorMsg("Password must be at least 8 characters long.");
        return;
      }
      if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        setErrorMsg("Password must contain at least one letter and one number.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    const url = activeTab === "login"
      ? "http://localhost:3000/api/auth/login"
      : "http://localhost:3000/api/auth/register";

    const payload = { email, password };

    try {
      const response = await axios.post(url, payload);
      const { token, user } = response.data.data;

      // Save to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Configure default headers for future axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Redirect to main features of the app
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Auth request failed:", err);
      const status = err.response?.status;
      const message = err.response?.data?.error || "Connection error. Please check if the backend is running.";

      if (activeTab === "signup" && status === 409) {
        setErrorMsg("This email is already registered. Would you like to log in instead?");
        setSuggestTab("login");
      } else if (activeTab === "login" && (status === 404 || message === "Email not registered")) {
        setErrorMsg("This email is not registered. Would you like to sign up instead?");
        setSuggestTab("signup");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
            <span className="auth-logo-text-brand">Careers</span>
            <span className="auth-logo-text-app">Empowered</span>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => handleTabChange("signup")}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="auth-alert auth-alert-error">
            {errorMsg}
            {suggestTab && (
              <span
                className="suggestion-link"
                onClick={() => handleTabChange(suggestTab)}
              >
                Switch to {suggestTab === "login" ? "Log In" : "Sign Up"}
              </span>
            )}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              {activeTab === "signup" ? "Create Password" : "Password"}
            </label>
            <div className="password-input-wrapper">
              <input
                id="auth-password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-2.956-2.956-2.64-2.64m-1.885-1.885a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {activeTab === "signup" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="auth-confirm-password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Processing..." : activeTab === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
