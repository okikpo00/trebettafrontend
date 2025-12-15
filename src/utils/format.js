// src/utils/format.js

export function formatCurrency(amount = 0) {
  const n = Number(amount) || 0;
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatCurrencyDetailed(amount = 0) {
  const n = Number(amount) || 0;
  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCountdown(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "";
  const s = Math.max(0, Number(seconds));

  const totalMinutes = Math.floor(s / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;



  if (days > 0) {
    return `Closes in ${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `Closes in ${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `Closes in ${mins}m`;
  }
  return "Closes soon";
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
