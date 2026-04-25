import { useState } from "react";
import type { UrlItem } from "../api/api";

type UrlListProps = {
  items: UrlItem[];
};

/** Return a human-friendly relative time string */
const timeAgo = (dateStr: string): string => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60)   return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60)      return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)     return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)      return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12)    return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      className={`copy-btn${copied ? " copied" : ""}`}
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy short URL"}
      type="button"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
};

const UrlList = ({ items }: UrlListProps) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h2>No links yet</h2>
        <p>Paste a URL above to create your first short link.</p>
      </div>
    );
  }

  return (
    <div className="list">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="list-item"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <div className="list-item-header">
            <div className="short-url-display">
              <a href={item.shortUrl} target="_blank" rel="noreferrer">
                {item.shortUrl}
              </a>
              <CopyButton text={item.shortUrl} />
            </div>
            <span className="click-badge">
              📊 {item.clickCount} click{item.clickCount !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="original-url">{item.originalUrl}</p>

          <div className="list-item-meta">
            <span className="meta-tag">
              🕐 {timeAgo(item.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UrlList;
