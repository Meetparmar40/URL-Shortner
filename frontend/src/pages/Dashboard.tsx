import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShortUrl, getUserUrls, type UrlItem } from "../api/api";
import { useToast } from "../components/ToastContext";
import UrlForm from "../components/UrlForm";
import UrlList from "../components/UrlList";

const Dashboard = () => {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail") ?? "User";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);

  const loadUrls = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getUserUrls(token);
      setUrls(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load URLs";
      setError(message);
      if (message.toLowerCase().includes("token") || message.toLowerCase().includes("failed")) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUrls();
  }, []);

  const handleCreate = async (originalUrl: string) => {
    if (!token) {
      navigate("/login");
      return;
    }

    await createShortUrl(originalUrl, token);
    await loadUrls();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    showToast("Signed out successfully", "info");
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="card dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1>Your Links</h1>
            <div className="user-badge">
              <div className="user-avatar">{userInitial}</div>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
          <button id="logout-btn" onClick={handleLogout} className="btn btn-ghost">
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{urls.length}</div>
            <div className="stat-label">Total Links</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalClicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
        </div>

        {/* URL Form */}
        <UrlForm onCreate={handleCreate} />

        <hr className="section-divider" />

        {/* Error */}
        {error && (
          <div className="alert-error" style={{ marginBottom: "1rem" }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* URL List / Loading */}
        {loading ? (
          <div className="skeleton">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-item" />
            ))}
          </div>
        ) : (
          <UrlList items={urls} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
