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

  const refreshWallet = async () => {
    try {
      setWalletLoading(true);
      const res = await api.get("/wallet/balance");
      setWallet(res.data?.status ? res.data.wallet : null);
    } catch {
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("trebetta_token")) {
      refreshWallet();
    }
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, walletLoading, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
