// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import SplashPage from "./pages/SplashPage";
import Home from "./pages/Home";
import MyPools from "./pages/MyPools";
import Wallet from "./pages/Wallet";
import PendingDeposit from "./pages/PendingDeposit";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import KycStatus from "./pages/KycStatus";
import KycSubmit from "./pages/KycSubmit";
import DeleteAccount from "./pages/DeleteAccount";
import ChangePassword from "./pages/ChangePassword";
import HelpCenter from "./pages/SupportHelpCenter";
import TermsPrivacy from "./pages/SupportTerms";
import ContactSupport from "./pages/SupportContact";
import Notifications from "./pages/Notifications";
import PoolDetails from "./pages/PoolDetails";
import PoolLedger from "./pages/PoolLedger";
import SlipViewer from "./pages/SlipViewer";

import RequestPinReset from "./pages/RequestPinReset";
import ConfirmPinReset from "./pages/ConfirmPinReset";
import ChangePin from "./pages/ChangePin";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPin from "./pages/ResetPin"; // ✅ NEW

import { WalletProvider } from "./context/WalletContext";

import "./styles/global.css";
import "./styles/theme.css";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("light");

  // Splash display (2.5s)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check session on load
  useEffect(() => {
    const token = localStorage.getItem("trebetta_token");
    setIsLoggedIn(!!token);
  }, []);

  // Theme toggle handler (kept as you had it)
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("trebetta_token");
    setIsLoggedIn(false);
  };

  if (showSplash && !isLoggedIn) return <SplashPage />;

  return (
    <WalletProvider>
      <Router>
        <Routes>
          {/* Auth pages */}
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Logged-in layout */}
          <Route
            path="/*"
            element={
              <Layout
                isLoggedIn={isLoggedIn}
                theme={theme}
                onToggleTheme={() =>
                  setTheme(theme === "light" ? "dark" : "light")
                }
                onLogout={handleLogout}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/home" />} />
                  <Route path="/home" element={<Home />} />

                  <Route
                    path="/mypools"
                    element={isLoggedIn ? <MyPools /> : <Navigate to="/login" />}
                  />

                  <Route
  path="/pools/:id"
  element={isLoggedIn ? <PoolDetails /> : <Navigate to="/login" />}
/>
 <Route
  path="/pools/:poolId/ledger"
  element={isLoggedIn ? <PoolLedger /> : <Navigate to="/login" />}
/>
<Route
  path="/slip/view"
  element={isLoggedIn ? <SlipViewer /> : <Navigate to="/login" />}
/>


                  <Route
                    path="/wallet"
                    element={isLoggedIn ? <Wallet /> : <Navigate to="/login" />}
                  />
                  
 
<Route path="/wallet/deposit/pending" element={<PendingDeposit />} />

                  <Route
                    path="/profile"
                    element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
                  />
                  <Route
  path="/profile/edit"
  element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />}
/>
<Route
  path="/profile/change-password"
  element={isLoggedIn ? <ChangePassword /> : <Navigate to="/login" />}
/>
<Route
  path="/profile/kyc/submit"
  element={isLoggedIn ? <KycSubmit /> : <Navigate to="/login" />}
/>
<Route
  path="/profile/kyc/status"
  element={isLoggedIn ? <KycStatus /> : <Navigate to="/login" />}
/>
<Route
  path="/support/help-center"
  element={<HelpCenter />}
/>
<Route
  path="/support/contact"
  element={<ContactSupport />}
/>
<Route
  path="/support/terms"
  element={<TermsPrivacy />}
/>

<Route path="/profile/pin/change" element={<ChangePin />} />
<Route path="/profile/pin/reset" element={<RequestPinReset />} />
<Route path="/profile/pin/reset/confirm" element={<ConfirmPinReset />} />


<Route
  path="/profile/delete-account"
  element={isLoggedIn ? <DeleteAccount /> : <Navigate to="/login" />}
/>


                  <Route
                    path="/notifications"
                    element={
                      isLoggedIn ? (
                        <Notifications />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  {/* ✅ Reset PIN page (logged-in users only) */}
                  <Route
                    path="/reset-pin"
                    element={isLoggedIn ? <ResetPin /> : <Navigate to="/login" />}
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </WalletProvider>
  );
};

export default App;