import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/notifications.css";

import Loader from "../components/Loader";
import Toast from "../components/Toast";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  return rtf.format(-days, "day");
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") =>
    setToast({ message, type });

  const loadNotifications = async (pageNum = 1, append = false) => {
    try {
      const res = await api.get("/notifications", {
        params: { page: pageNum, limit: 20 },
      });

      if (res.data?.status) {
        const data = res.data.data || [];
        const pg = res.data.pagination;

        setItems((prev) => (append ? [...prev, ...data] : data));
        setPage(pg.page);
        setPageCount(pg.page_count);
      }
    } catch {
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    loadNotifications(1);
  }, []);

  // auto refresh every 30s
  useEffect(() => {
    const t = setInterval(() => loadNotifications(1), 30000);
    return () => clearInterval(t);
  }, []);

  const handleClick = async (n) => {
    if (!n.is_read) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, is_read: true } : x
          )
        );
      } catch {}
    }

    // Navigation via metadata
    if (n.metadata?.pool_id) {
      window.location.href = `/pools/${n.metadata.pool_id}`;
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  return (
    <div className="notifications-page container">
      <header className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>

        {items.some((n) => !n.is_read) && (
          <button className="btn ghost small" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </header>

      {loading && items.length === 0 ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-title">No notifications yet</div>
          <div className="empty-text">
            Your activity and updates will appear here.
          </div>
        </div>
      ) : (
        <div className="notifications-list">
          {items.map((n) => (
            <div
              key={n.id}
              className={`notification-row ${
                n.is_read ? "read" : "unread"
              }`}
              onClick={() => handleClick(n)}
            >
              <span
                className={`notification-dot ${n.severity || "info"}`}
              />

              <div className="notification-content">
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-time">
                  {timeAgo(n.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {page < pageCount && (
        <div className="notifications-load-more">
          <button
            className="btn ghost"
            onClick={() => loadNotifications(page + 1, true)}
          >
            Load more
          </button>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
