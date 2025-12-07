// src/components/HomeBillboard.jsx
import React, { useEffect, useState } from "react";
import "../css/home.css";

export default function HomeBillboard({ items = [], loading, onHowItWorks }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasItems = Array.isArray(items) && items.length > 0;

  // Auto-slide
  useEffect(() => {
    if (!hasItems) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= items.length ? 0 : next;
      });
    }, 6000); // 6s

    return () => clearInterval(interval);
  }, [hasItems, items.length]);

  const goTo = (index) => {
    if (!hasItems) return;
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    setActiveIndex(index);
  };

  const handleClick = (item) => {
    if (!item?.redirect_link) return;

    const url = item.redirect_link.trim();

    // External link
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    // Internal route
    if (url.startsWith("/")) {
      window.location.href = url;
    } else {
      // fallback: treat as path
      window.location.href = `/${url}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="home-billboard">
        <div className="card home-billboard-skeleton">
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar short" />
        </div>
      </section>
    );
  }

  // No items → fallback hero
  if (!hasItems) {
    return (
      <section className="home-billboard card">
        <div className="home-billboard-main">
          <div className="home-billboard-kicker small muted">
            TREND • PREDICT • WIN
          </div>
          <h1 className="home-billboard-title">
            Welcome to Trebetta
          </h1>
          <p className="home-billboard-text small">
            Join live pulse & grand pools on what&apos;s trending in Nigeria —
            from football to reality TV. Lock your prediction and watch it play out.
          </p>
          <div className="home-billboard-actions">
            <button
              type="button"
              className="btn primary home-billboard-cta"
              onClick={onHowItWorks}
            >
              How Trebetta works
            </button>
          </div>
        </div>
      </section>
    );
  }

  // We have billboard items
  const current = items[activeIndex];

  return (
    <section className="home-billboard card home-billboard-carousel">
      {/* Left: Text / CTA */}
      <div className="home-billboard-main">
        <div className="home-billboard-kicker small muted">
          TREBETTA BILLBOARD
        </div>

        <h1 className="home-billboard-title">
          {current.title || "Trebetta"}
        </h1>

        {current.description && (
          <p className="home-billboard-text small">
            {current.description}
          </p>
        )}

        <div className="home-billboard-actions">
          {current.redirect_link && (
            <button
              type="button"
              className="btn primary home-billboard-cta"
              onClick={() => handleClick(current)}
            >
              Explore
            </button>
          )}

          <button
            type="button"
            className="btn ghost home-billboard-ghost"
            onClick={onHowItWorks}
          >
            How Trebetta works
          </button>
        </div>

        {/* Carousel dots */}
        {items.length > 1 && (
          <div className="home-billboard-dots">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                className={
                  "home-billboard-dot" +
                  (idx === activeIndex ? " home-billboard-dot-active" : "")
                }
                onClick={() => goTo(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Image / Video */}
      <div
        className="home-billboard-media"
        onClick={() => handleClick(current)}
        style={{ cursor: current.redirect_link ? "pointer" : "default" }}
      >
        {current.video_url ? (
          <video
            src={current.video_url}
            className="home-billboard-media-video"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : current.image_url ? (
          <img
            src={current.image_url}
            alt={current.title || "Trebetta billboard"}
          />
        ) : (
          <div className="home-billboard-media-fallback small muted">
            Trebetta
          </div>
        )}
      </div>
    </section>
  );
}
