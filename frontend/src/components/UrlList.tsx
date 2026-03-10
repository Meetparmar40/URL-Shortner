import type { UrlItem } from "../api/api";

type UrlListProps = {
  items: UrlItem[];
};

const UrlList = ({ items }: UrlListProps) => {
  if (items.length === 0) {
    return <p className="muted">No URLs yet. Create your first short URL.</p>;
  }

  return (
    <div className="list">
      {items.map((item) => (
        <div key={item.id} className="list-item">
          <p>
            <strong>Original:</strong>{" "}
            <a href={item.originalUrl} target="_blank" rel="noreferrer">
              {item.originalUrl}
            </a>
          </p>
          <p>
            <strong>Short:</strong>{" "}
            <a href={item.shortUrl} target="_blank" rel="noreferrer">
              {item.shortUrl}
            </a>
          </p>
          <p>
            <strong>Clicks:</strong> {item.clickCount}
          </p>
          <p>
            <strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default UrlList;
