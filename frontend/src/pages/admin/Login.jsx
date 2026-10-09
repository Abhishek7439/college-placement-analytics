import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo area */}
        <div className="text-center mb-5">
          <div
            style={{
              width: 60,
              height: 60,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(37,99,235,.4)",
            }}
          >
            <i className="bi bi-mortarboard-fill" style={{ fontSize: 28, color: "#fff" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
            College Placement Analytics
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginTop: 4 }}>
            Administration Portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "32px 28px",
            boxShadow: "0 20px 60px rgba(0,0,0,.3)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
            Enter your credentials to access the admin panel
          </p>

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#991b1b",
              }}
            >
              <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label">Username</label>
              <div
                className="input-group"
                style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}
              >
                <span className="input-group-text" style={{ border: "none", background: "#f8fafc", borderRight: "1px solid #e2e8f0" }}>
                  <i className="bi bi-person" style={{ color: "#64748b" }} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ border: "none", boxShadow: "none" }}
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="form-label">Password</label>
              <div
                className="input-group"
                style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}
              >
                <span className="input-group-text" style={{ border: "none", background: "#f8fafc", borderRight: "1px solid #e2e8f0" }}>
                  <i className="bi bi-lock" style={{ color: "#64748b" }} />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  className="form-control"
                  style={{ border: "none", boxShadow: "none" }}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-group-text"
                  style={{ border: "none", background: "#f8fafc", borderLeft: "1px solid #e2e8f0", cursor: "pointer" }}
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "#64748b" }} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "#fff",
                border: "none",
                padding: "11px",
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 10,
                letterSpacing: "0.02em",
                boxShadow: "0 4px 14px rgba(37,99,235,.35)",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="text-center mt-4">
            <Link
              to="/"
              style={{ fontSize: 13, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <i className="bi bi-arrow-left" />
              Back to public dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
