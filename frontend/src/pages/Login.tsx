import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/api";
import { useToast } from "../components/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      localStorage.setItem("userEmail", response.user.email);
      showToast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="auth-brand">
          <div className="brand-icon">🔗</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Sniplink account</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <input
              id="login-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="input-icon">✉</span>
          </div>

          <div className="input-group">
            <input
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="input-icon">🔒</span>
          </div>

          {error && (
            <div className="alert-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
