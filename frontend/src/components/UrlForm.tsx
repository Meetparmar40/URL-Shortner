import { useState } from "react";

type UrlFormProps = {
  onCreate: (originalUrl: string) => Promise<void>;
};

const UrlForm = ({ onCreate }: UrlFormProps) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form horizontal-form">
      <input
        type="url"
        placeholder="https://example.com/very/long/path"
        value={originalUrl}
        onChange={(event) => setOriginalUrl(event.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Shortening..." : "Shorten"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default UrlForm;
