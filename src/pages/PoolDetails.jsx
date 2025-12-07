// src/pages/PoolDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

import "../css/pools.css";

import PoolCountdown from "../components/PoolCountdown";
import PoolProgressBar from "../components/PoolProgressBar";
import PoolOptionCard from "../components/PoolOptionCard";
import WinMeterDisplay from "../components/WinMeterDisplay";
import JoinPoolModal from "../components/JoinPoolModal";
import Toast from "../components/Toast";
import { LineChart, Line, Area } from "recharts";

import Loader from "../components/Loader";

import { Trophy, ArrowLeft, Share2, Users } from "lucide-react";

export default function PoolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winmeterLoading, setWinmeterLoading] = useState(false);
  const [winmeterAmount, setWinmeterAmount] = useState(0);

  const [toast, setToast] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchPool = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pools/${id}`);
      if (res.data?.status && res.data?.data) {
        const p = res.data.data;
        setPool(p);
        if (p.user_option) {
          setSelectedOptionId(p.user_option);
        }
      } else {
        showToast(res.data?.message || "Could not load pool", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load pool",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWinmeter = async (poolObj) => {
    if (!poolObj) {
      setWinmeterAmount(0);
      return;
    }

    // treat as joined if user has any entry info
    const hasUserEntry =
      !!poolObj.user_joined ||
      !!poolObj.user_option ||
      !!poolObj.user_stake;

    if (!hasUserEntry) {
      setWinmeterAmount(0);
      return;
    }

    // Only for open/locked pools
    const status = (poolObj.status || "").toLowerCase();
    if (!["open", "locked"].includes(status)) {
      setWinmeterAmount(0);
      return;
    }

    setWinmeterLoading(true);
    try {
      const res = await api.get(`/pools/${poolObj.id}/winmeter`, {
        params: {
          option_id: poolObj.user_option,
          stake: poolObj.user_stake,
        },
      });
      if (res.data?.status && res.data?.data) {
        const win = Number(res.data.data.win || 0);
        setWinmeterAmount(win);
      } else {
        setWinmeterAmount(0);
      }
    } catch (err) {
      setWinmeterAmount(0);
    } finally {
      setWinmeterLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (pool) {
      fetchWinmeter(pool);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool?.user_option, pool?.user_stake, pool?.status]);

  const handleJoined = async (updatedPool) => {
    // If modal gives us updated pool, use it.
    if (updatedPool) {
      setPool(updatedPool);
      if (updatedPool.user_option) {
        setSelectedOptionId(updatedPool.user_option);
      }
      fetchWinmeter(updatedPool);
      return;
    }

    // Fallback: re-fetch from backend to make sure user_joined / user_option come in
    await fetchPool();
  };

  // 🔥 FRONTEND-ONLY SLIP SHARE
  const handleShareSlip = () => {
    if (!pool) {
      showToast("Slip not ready yet", "error");
      return;
    }

    // Send the full pool object to SlipViewer (frontend-only slip)
    navigate("/slip/view", {
      state: {
        pool: JSON.parse(JSON.stringify(pool)),
      },
    });
  };

  const poolStatus = (pool?.status || "").toLowerCase();
 const isLocked = poolStatus === "locked";
const isSettled = ["closed", "settled", "rollover", "refunded"].includes(poolStatus);
// locked MUST NOT be part of settled


  // Treat user as joined if backend gives ANY of these
  const hasUserEntry =
    !!pool?.user_joined || !!pool?.user_option || !!pool?.user_stake;
const showJoinStrip =
  !hasUserEntry && poolStatus === "open"; // locked should NOT allow join, but shouldn't mark settled


  // Show Share Slip only when pool is settled & user has entry
  const canShowShareSlip = isSettled && hasUserEntry;

  return (
    <div className="pool-page container">
      {/* BACK BUTTON */}
      <button
        type="button"
        className="btn ghost"
        style={{ marginBottom: 8 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span className="small">Back</span>
      </button>

      {loading ? (
        <div className="card pool-skeleton-card skeleton">
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
        </div>
      ) : !pool ? (
        <div className="card">
          <div className="wallet-empty-title">Pool not found</div>
          <p className="small muted">
            The pool you&apos;re looking for might have been removed or is not accessible.
          </p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <header className="pool-header">
            <div className="pool-header-top">
              <div>
                <h1 className="pool-title">{pool.title}</h1>
                <div className="pool-header-meta">
                  <span
                    className={
                      "pool-type-badge " +
                      (pool.type === "grand" ? "grand" : "pulse")
                    }
                  >
                    {pool.type === "grand" ? "Grand Pool" : "Pulse Pool"}
                  </span>

                  <span
                    className={
                      "pool-status-pill " +
                      (poolStatus === "open"
                        ? "open"
                        : poolStatus === "locked"
                        ? "locked"
                        : "settled")
                    }
                  >
                    {poolStatus === "open"
                      ? "Open"
                      : poolStatus === "locked"
                      ? "Locked"
                      : poolStatus === "rollover"
                      ? "Rollover"
                      : "Settled"}
                  </span>

                  <PoolCountdown
                    closingDate={pool.closing_date}
                    status={pool.status}
                  />
                </div>
              </div>

              <div className="small muted" style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Trophy size={16} />
                  <span>
                    Payout pool: ₦
                    {Number(pool.payout_pool || 0).toLocaleString("en-NG", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                {/* Company cut intentionally hidden */}
              </div>
            </div>
          </header>

          {/* TOP METRICS */}
          <section className="pool-metrics-card">
            <div className="pool-progress-card">
              <div className="pool-metric-label">Pool Progress</div>
              <PoolProgressBar
                progress={pool.progress || 0}
                type={pool.type}
                total={pool.total_stake}
                target={pool.target}
              />
            </div>

            <div className="pool-stats-card">
              <div className="pool-metric-label">Pool Overview</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <div>
                  <div className="pool-metric-label">Min entry</div>
                  <div className="pool-metric-value">
                    ₦
                    {Number(pool.min_entry || 0).toLocaleString("en-NG", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
                <div>
                  <div className="pool-metric-label">Total stake</div>
                  <div className="pool-metric-value">
                    ₦
                    {Number(pool.total_stake || 0).toLocaleString("en-NG", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Users size={16} />
                  <span className="small muted">
                    Participants:{" "}
                    {Number(pool.participants || 0).toLocaleString("en-NG")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          {pool.description && (
            <section className="pool-description-card">
              <div className="pool-metric-label">Description</div>
              <div className="small" style={{ marginTop: 4 }}>
                {pool.description}
              </div>
            </section>
          )}

          {/* OPTIONS */}
          <section className="pool-options-section">
            <div className="pool-options-header">
              <h2 className="wallet-activity-title">Options</h2>
              {hasUserEntry && pool.user_option && (
                <span className="badge-sm">
                  Your pick is highlighted below
                </span>
              )}
            </div>

            <div className="pool-options-grid">
              {pool.options?.map((opt) => (
                <PoolOptionCard
                  key={opt.id}
                  option={opt}
                  poolStatus={pool.status}
                  isSelected={selectedOptionId === opt.id}
                  isUserPick={pool.user_option === opt.id}
                  onSelect={() => setSelectedOptionId(opt.id)}
                />
              ))}
            </div>
          </section>

          {/* WINMETER (only when user has entry) */}
          {hasUserEntry && (
            <section>
 {/* WINMETER SPARKLINE WITH CONFIDENCE */}
<section className="pool-winmeter-card">
  <div className="pool-metric-label">Your WinMeter</div>

  {winmeterLoading ? (
    <div className="winmeter-loading small muted">Calculating…</div>
  ) : (
    <>
      {/* CALCULATE CONFIDENCE */}
      {(() => {
        const stake = Number(pool.user_stake || 0);
        let confidence = 0;
        if (stake > 0) confidence = Math.min((winmeterAmount / stake) * 100, 300);

        let confLabel = "Low Confidence";
        let confClass = "conf-low";

        if (confidence >= 70) {
          confLabel = "High Confidence";
          confClass = "conf-high";
        } else if (confidence >= 35) {
          confLabel = "Medium Confidence";
          confClass = "conf-mid";
        }

        return (
          <>
            <div className="winmeter-amount-row">
              <span className="winmeter-amount-main">
                ₦{Number(winmeterAmount || 0).toLocaleString("en-NG")}
              </span>

              <span className="winmeter-sub small muted">
                Stake: ₦{stake.toLocaleString("en-NG")}
              </span>
            </div>

            {/* CONFIDENCE STRIP */}
            <div className={`winmeter-confidence ${confClass}`}>
              <span className="conf-value">{confLabel}</span>
              <span className="conf-percent small">
                {Math.round(confidence)}%
              </span>
            </div>

            {/* Sparkline chart */}
            <div className="winmeter-chart-wrap">
              <LineChart
                width={300}
                height={120}
                data={[
                  { v: 0 },
                  { v: winmeterAmount * 0.25 },
                  { v: winmeterAmount * 0.4 },
                  { v: winmeterAmount * 0.15 },
                  { v: winmeterAmount }, // current predicted win
                ]}
              >
                <defs>
                  <linearGradient id="grad-win" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e63946" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#e63946" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#e63946"
                  strokeWidth={3}
                  dot={false}
                />

                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="none"
                  fill="url(#grad-win)"
                />
              </LineChart>
            </div>
          </>
        );
      })()}
    </>
  )}
</section>



              {/* SHARE SLIP CTA (only for settled pools, under WinMeter) */}
              {canShowShareSlip && (
                <div className="pool-share-row">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={handleShareSlip}
                  >
                    <Share2 size={16} />
                    <span className="small">Share Slip</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* JOIN CTA STRIP – disappears once user has any entry */}
          {showJoinStrip && (
            <section className="pool-join-strip">
              <div className="pool-join-info">
                <div className="small">
                  Min entry: ₦
                  {Number(pool.min_entry || 0).toLocaleString("en-NG", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="small muted">
                  Pick your side and lock your Trebetta prediction.
                </div>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (!selectedOptionId && pool.options?.[0]?.id) {
                    setSelectedOptionId(pool.options[0].id);
                  }
                  setShowJoin(true);
                }}
              >
                Join pool
              </button>
            </section>
          )}

          {/* JOIN MODAL */}
          {showJoin && (
            <JoinPoolModal
              pool={pool}
              options={pool.options || []}
              defaultOptionId={selectedOptionId}
              onClose={() => setShowJoin(false)}
              onJoined={handleJoined}
              showToast={showToast}
            />
          )}
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
