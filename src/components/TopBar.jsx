import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaWallet, FaMoon, FaSun } from 'react-icons/fa';
import api from '../api';
import '../css/topbar.css';

export default function TopBar({
  isLoggedIn = false,
  walletBalance = 0,
  onToggleTheme,
  theme = 'light'
}) {
  const nav = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔔 Load unread notification count
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        if (res.data?.status) {
          setUnreadCount(res.data.unread || 0);
        }
      } catch (_) {}
    };

    loadUnread();
    const interval = setInterval(loadUnread, 30000); // auto refresh
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <div className="left" onClick={() => nav('/home')}>
          <div className="brand">TREBETTA</div>
        </div>

        <div className="center">
          <div className="search" onClick={() => nav('/search')}>
            <FaSearch className="ico" />
            <input placeholder="Search pools, trends..." readOnly />
          </div>
        </div>

        <div className="right">
          <button
            className="icon-btn theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {!isLoggedIn ? (
            <>
              <button className="btn ghost" onClick={() => nav('/register')}>
                Join Now
              </button>
              <button className="btn primary" onClick={() => nav('/login')}>
                Login
              </button>
            </>
          ) : (
            <>
              <div className="wallet" onClick={() => nav('/wallet')}>
                <FaWallet />
                <span className="wallet-amt">
                  ₦{Number(walletBalance || 0).toLocaleString()}
                </span>
              </div>

              {/* 🔔 Notification Bell */}
              <button
                className="icon-btn notif-bell"
                onClick={() => nav('/notifications')}
                aria-label="Notifications"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notif-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
