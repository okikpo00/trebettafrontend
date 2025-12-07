// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

import "../css/pools.css";
import "../css/home.css";

import HomeBillboard from "../components/HomeBillboard";
import HomeActivityTicker from "../components/HomeActivityTicker";
import WinnerTicker from "../components/WinnerTicker";
import PoolTypeTabs from "../components/PoolTypeTabs";
import PoolCard from "../components/PoolCard";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

const DEFAULT_PULSE_MIN = 500;
const DEFAULT_GRAND_MIN = 1000;

export default function Home() {
  const navigate = useNavigate();

  const [activeType, setActiveType] = useState("pulse");

  const [billboards, setBillboards] = useState([]);
  const [billboardLoading, setBillboardLoading] = useState(false);

  const [poolsPulse, setPoolsPulse] = useState([]);
  const [poolsGrand, setPoolsGrand] = useState([]);
  const [poolsLoading, setPoolsLoading] = useState(false);

  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [winners, setWinners] = useState([]);
  const [winnersLoading, setWinnersLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // POOls
  const loadPools = async () => {
    setPoolsLoading(true);
    try {
      const [pulseRes, grandRes] = await Promise.all([
        api.get("/pools", { params: { type: "pulse", limit: 20 } }),
        api.get("/pools", { params: { type: "grand", limit: 20 } }),
      ]);

      if (pulseRes.data?.status && Array.isArray(pulseRes.data.data)) {
        setPoolsPulse(pulseRes.data.data);
      } else {
        setPoolsPulse([]);
      }

      if (grandRes.data?.status && Array.isArray(grandRes.data.data)) {
        setPoolsGrand(grandRes.data.data);
      } else {
        setPoolsGrand([]);
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load pools",
        "error"
      );
    } finally {
      setPoolsLoading(false);
    }
  };

  // Billboards
  const loadBillboards = async () => {
    setBillboardLoading(true);
    try {
      const res = await api.get("/billboard");
      if (res.data?.status && Array.isArray(res.data.data)) {
        setBillboards(res.data.data);
      } else {
        setBillboards([]);
      }
    } catch (err) {
      // soft fail
    } finally {
      setBillboardLoading(false);
    }
  };

  // Recent activity
  const loadActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await api.get("/pools/recent-activity", {
        params: { limit: 20 },
      });
      if (res.data?.status && Array.isArray(res.data.data)) {
        setRecentActivity(res.data.data);
      } else {
        setRecentActivity([]);
      }
    } catch (err) {
      // soft fail
    } finally {
      setActivityLoading(false);
    }
  };

  // Winners
  const loadWinners = async () => {
    setWinnersLoading(true);
    try {
      const res = await api.get("/winner-ticker/ticker", {
        params: { limit: 10 },
      });
      if (res.data?.status && Array.isArray(res.data.data)) {
        setWinners(res.data.data);
      } else {
        setWinners([]);
      }
    } catch (err) {
      // soft fail
    } finally {
      setWinnersLoading(false);
    }
  };

  // First load
  useEffect(() => {
    loadBillboards();
    loadPools();
    loadActivity();
    loadWinners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 // include OPEN + LOCKED pools
const filteredPoolsPulse = poolsPulse.filter(
  (p) => p.status === "open" || p.status === "locked"
);
const filteredPoolsGrand = poolsGrand.filter(
  (p) => p.status === "open" || p.status === "locked"
);

const currentPools =
  activeType === "pulse" ? filteredPoolsPulse : filteredPoolsGrand;


  // Simple refresh handler (you can later attach to a pull-to-refresh / icon)
  const handleRefresh = () => {
    loadPools();
    loadActivity();
    loadWinners();
  };

  return (
    <div className="home-page">
      {/* Billboard / hero */}
      <HomeBillboard
        items={billboards}
        loading={billboardLoading}
        onHowItWorks={() =>
          showToast(
            "On launch we’ll link this to a How it works page.",
            "info"
          )
        }
      />

      {/* Recent activity ticker */}
      {!activityLoading && recentActivity.length > 0 && (
        <HomeActivityTicker items={recentActivity} />
      )}

      {/* Pools switcher */}
      <PoolTypeTabs
        activeType={activeType}
        onChange={setActiveType}
        pulseMin={DEFAULT_PULSE_MIN}
        grandMin={DEFAULT_GRAND_MIN}
      />

      {/* Pool cards */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">
            {activeType === "pulse" ? "Pulse Pools closing soon" : "Grand Pools"}
          </h2>

          {/* placeholder refresh (you can style it or swap to icon) */}
          <button
            type="button"
            className="home-refresh-btn small"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>

        {poolsLoading ? (
          <div className="home-pools-loader">
            <Loader />
          </div>
        ) : currentPools.length === 0 ? (
          <div className="home-empty-state small muted">
            No open {activeType === "pulse" ? "Pulse" : "Grand"} pools right
            now. Check back soon.
          </div>
        ) : (
          <div className="home-pools-list">
            {currentPools.map((p) => (
              <PoolCard
                key={p.id}
                pool={p}
                onOpenDetails={(pool) => navigate(`/pools/${pool.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Winner ticker at the bottom */}
      {!winnersLoading && winners.length > 0 && (
        <WinnerTicker items={winners} />
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
