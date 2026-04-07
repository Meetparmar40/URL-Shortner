import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShortUrl, getUserUrls, type UrlItem } from "../api/api";
import UrlForm from "../components/UrlForm";
import UrlList from "../components/UrlList";

const Dashboard = () => {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail") ?? "User";

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
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="card dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Your URLs</h1>
            <p className="muted">Signed in as {userEmail}</p>
          </div>
          <button onClick={handleLogout} className="secondary-btn">
            Logout
          </button>
        </div>

        <UrlForm onCreate={handleCreate} />
        {error && <p className="error">{error}</p>}
        {loading ? <p className="muted">Loading...</p> : <UrlList items={urls} />}
      </div>
    </div>
  );
};

export default Dashboard;
