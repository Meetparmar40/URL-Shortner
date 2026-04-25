import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/api";
import { useToast } from "../components/ToastContext";

const Signup = () => {
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
      await signup(email, password);
      showToast("Account created! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
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
          <h1>Create Account</h1>
          <p>Start shortening your URLs with Sniplink</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <input
              id="signup-email"
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
              id="signup-password"
              type="password"
              placeholder="Create a password"
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

          <button id="signup-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
