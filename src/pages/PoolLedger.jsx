// src/pages/PoolLedger.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../css/ledger.css";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "../utils/format";

export default function PoolLedger() {
  const { poolId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load ledger
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/pools/${poolId}/ledger`);
        if (res.data?.status) {
          setData(res.data.data);
        }
      } catch (err) {
        console.log("Ledger error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [poolId]);

  if (loading) return <div className="ledger-page pad">Loading...</div>;
  if (!data) return <div className="ledger-page pad">No ledger found</div>;

  return (
    <div className="ledger-page">
      {/* BACK BUTTON */}
      <button
        className="ledger-back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* HEADER */}
      <h1 className="ledger-title">{data.title}</h1>
      <div className="ledger-sub">
        {data.type === "pulse" ? "Pulse Pool" : "Grand Pool"} · Settled
      </div>

      {/* SUMMARY CARD */}
      <div className="ledger-card">
        <div className="ledger-row">
          <span>Total Pot</span>
          <b>{formatCurrency(data.total_stake)}</b>
        </div>

        <div className="ledger-row">
          <span>Stability Reserve</span>
          <b>{data.company_cut_percent}%</b>
        </div>

        <div className="ledger-row">
          <span>Payout Pool</span>
          <b>{formatCurrency(data.payout_pool)}</b>
        </div>
      </div>

      {/* WINNERS */}
      <h3 className="ledger-section-title">
        Winners
      </h3>

      {data.winners?.length > 0 ? (
        <div className="ledger-card">
          {data.winners.map((w, idx) => (
            <div className="ledger-row" key={idx}>
              <span>{w.masked_username}</span>
              <b>{formatCurrency(w.amount_won)}</b>
            </div>
          ))}

          <div className="ledger-note small">
            Winnings are shared proportionally based on each winner’s stake.
          </div>
        </div>
      ) : (
        <div className="ledger-card">
          <div className="ledger-row">
            <span>No winners in this pool</span>
          </div>
          {data.rollover_amount > 0 && (
            <div className="ledger-note small">
              This pot rolled into Trebetta’s rollover stash.
            </div>
          )}
        </div>
      )}

      {/* ROLLOVER CARD */}
      {data.rollover_amount > 0 && (
        <>
          <h3 className="ledger-section-title">Rollover Stash</h3>
          <div className="ledger-card">
            <div className="ledger-row">
              <span>Rollover Amount</span>
              <b>{formatCurrency(data.rollover_amount)}</b>
            </div>

            <div className="ledger-note small">
              Rollover boosts future prize pools for special events.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
