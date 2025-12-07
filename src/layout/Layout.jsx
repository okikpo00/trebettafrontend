// src/layout/Layout.jsx
import React, { useEffect, useState, useContext } from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import { WalletContext } from "../context/WalletContext";
import api from "../api";   // <— added
import "../styles/theme.css";
import "../styles/global.css";
import "./Layout.css";

export default function Layout({
  children,
  isLoggedIn = false,
  walletBalance: walletBalanceProp = 0,
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("trebetta_theme") || "light"
  );

  const { wallet } = useContext(WalletContext);

  const effectiveWalletBalance =
    wallet?.balance != null ? wallet.balance : walletBalanceProp || 0;

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light"
    );
    localStorage.setItem("trebetta_theme", theme);
  }, [theme]);

  // ⭐ NEW — Load wallet balance as soon as user logs in
  useEffect(() => {
    async function loadBalance() {
      try {
        const res = await api.get("/wallet/balance");
        if (wallet?.setBalance && res.data?.balance != null) {
          wallet.setBalance(res.data.balance);
        }
      } catch (e) {
        // ignore silent errors
      }
    }

    if (isLoggedIn) {
      loadBalance();
    }
  }, [isLoggedIn]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app-shell">
      <TopBar
        isLoggedIn={isLoggedIn}
        walletBalance={effectiveWalletBalance}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
      <main className="main-content container">{children}</main>
      <BottomNav />
    </div>
  );
}
