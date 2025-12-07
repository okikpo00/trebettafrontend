// src/pages/MyPools.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

import "../css/mypools.css";
import "../css/pools.css";

import MyPoolCard from "../components/MyPoolCard";
import MyPoolEmpty from "../components/MyPoolEmpty";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

export default function MyPools() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'settled'

  const showToast = (msg, type = "info") => {
    setToast({ message: msg, type });
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/pools/my");
        if (res.data?.status && mounted) {
          setPools(res.data.data || []);
        } else if (mounted) {
          showToast("Could not load your pools", "error");
        }
      } catch (err) {
        if (mounted) showToast("Failed to load your pools", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

// ACTIVE = open + locked
const activePools = pools.filter((p) =>
  ["open", "locked"].includes(p.pool_status)
);

// SETTLED = everything else
const settledPools = pools.filter((p) =>
  ["settled", "closed", "rollover", "refunded"].includes(p.pool_status)
);


  const openCount = activePools.length;
  const settledCount = settledPools.length;

  const visibleList = activeTab === "active" ? activePools : settledPools;

  return (
    <div className="mypools-page">
      <header className="mypools-header">
        <h1 className="mypools-title">My Pools</h1>
      </header>

      {loading ? (
        <div className="mypools-loader">
          <Loader />
        </div>
      ) : pools.length === 0 ? (
        <MyPoolEmpty />
      ) : (
        <>
          {/* Toggle */}
          <div className="mypools-toggle">
            <button
              type="button"
              className={
                "mypools-toggle-btn " +
                (activeTab === "active" ? "mypools-toggle-btn-active" : "")
              }
              onClick={() => setActiveTab("active")}
            >
              Active ({openCount})
            </button>
            <button
              type="button"
              className={
                "mypools-toggle-btn " +
                (activeTab === "settled" ? "mypools-toggle-btn-active" : "")
              }
              onClick={() => setActiveTab("settled")}
            >
              Settled ({settledCount})
            </button>
          </div>

          {/* List for selected tab */}
          <section className="mypools-section">
            <h2 className="mypools-section-title">
              {activeTab === "active"
                ? "Active Pools"
                : "Settled Pools"}
            </h2>

            {visibleList.length === 0 ? (
              <div className="mypools-empty-group small muted">
                {activeTab === "active"
                  ? "You have no active predictions."
                  : "No past pools yet."}
              </div>
            ) : (
              <div className="mypools-list">
                {visibleList.map((p) => (
                  <MyPoolCard
                    key={`${p.pool_id}-${p.entry_status || "na"}-${
                      p.user_option || "none"
                    }`}
                    pool={p}
                  />
                ))}
              </div>
            )}
          </section>
        </>
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

