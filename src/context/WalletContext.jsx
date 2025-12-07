// src/context/WalletContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const WalletContext = createContext({
  wallet: null,
  walletLoading: false,
  refreshWallet: () => {},
});

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Load wallet balance from backend
  const refreshWallet = async () => {
    try {
      setWalletLoading(true);
      const res = await api.get("/wallet/balance");

      if (res.data?.status && res.data.wallet) {
        setWallet(res.data.wallet);
      } else {
        setWallet(null);
      }
    } catch (err) {
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  };

  // --- AUTO LOAD WALLET ON APP START ---
  useEffect(() => {
    const token = localStorage.getItem("trebetta_token");

    if (token) {
      refreshWallet();     // fetch wallet immediately
    } else {
      setWallet(null);     // no token → not logged in
    }
  }, []);

  // --- REFRESH WALLET WHEN TOKEN CHANGES ---
  useEffect(() => {
    const handler = () => {
      const token = localStorage.getItem("trebetta_token");
      if (token) {
        refreshWallet();
      } else {
        setWallet(null);
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, walletLoading, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
