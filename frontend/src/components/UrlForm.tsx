import { useState } from "react";
import { useToast } from "./ToastContext";

type UrlFormProps = {
  onCreate: (originalUrl: string) => Promise<void>;
};

const UrlForm = ({ onCreate }: UrlFormProps) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!originalUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      await onCreate(originalUrl.trim());
      setOriginalUrl("");
      showToast("Short URL created!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to shorten URL";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form horizontal-form" id="url-shorten-form">
      <div className="input-group">
        <input
          id="url-input"
          type="url"
          placeholder="Paste your long URL here…"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <span className="input-icon">🔗</span>
      </div>
      <button id="url-submit" type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" />
            Shortening…
          </>
        ) : (
          "Shorten"
        )}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default UrlForm;
