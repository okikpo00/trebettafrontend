import React, { useEffect, useState } from "react";
import "../css/home.css";

export default function HomeBillboard({ items = [], loading, onHowItWorks }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasItems = Array.isArray(items) && items.length > 0;

  // Auto-slide
  useEffect(() => {
    if (!hasItems) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
    }, 6000);

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

    if (url.startsWith("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url.startsWith("/") ? url : `/${url}`;
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <section className="home-hero">
        <div className="home-hero-skeleton" />
      </section>
    );
  }

  /* ---------------- Empty State ---------------- */
  if (!hasItems) {
    return (
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-kicker">TREND • PREDICT • WIN</span>
          <h1 className="home-hero-title">Welcome to Trebetta</h1>
          <p className="home-hero-text">
            Join live Pulse & Grand pools on what’s trending in Nigeria — from
            football to reality TV. Lock your prediction and watch it play out.
          </p>

          <div className="home-hero-actions">
            <button className="btn primary" onClick={onHowItWorks}>
              How Trebetta works
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------- Carousel ---------------- */
  const current = items[activeIndex];

  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        {/* LEFT */}
        <div className="home-hero-content">
          <span className="home-hero-kicker"></span>

          <h1 className="home-hero-title">
            {current.title || "Trebetta"}
          </h1>

          {current.description && (
            <p className="home-hero-text">{current.description}</p>
          )}

          <div className="home-hero-actions">
            {current.redirect_link && (
              <button
                className="btn primary"
                onClick={() => handleClick(current)}
              >
                Explore
              </button>
            )}
            <button className="btn ghost" onClick={onHowItWorks}>
              
            </button>
          </div>

          {items.length > 1 && (
            <div className="home-hero-dots">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  className={
                    "hero-dot" +
                    (idx === activeIndex ? " hero-dot-active" : "")
                  }
                  onClick={() => goTo(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div
          className="home-hero-media"
          onClick={() => handleClick(current)}
        >
          {current.video_url ? (
            <video
              src={current.video_url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : current.image_url ? (
            <img src={current.image_url} alt={current.title || "Trebetta"} />
          ) : (
            <div className="home-hero-media-fallback"></div>
          )}
        </div>
      </div>
    </section>
  );
}
