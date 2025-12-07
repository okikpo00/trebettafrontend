import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaWallet, FaMoon, FaSun } from 'react-icons/fa';
import '../css/topbar.css';

export default function TopBar({ isLoggedIn=false, walletBalance=0, onToggleTheme, theme='light'}){
  const nav = useNavigate();
  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <div className="left" onClick={()=>nav('/home')}>
          <div className="brand">TREBETTA</div>
        </div>

        <div className="center">
          <div className="search" onClick={()=>nav('/search')}>
            <FaSearch className="ico" />
            <input placeholder="Search pools, trends..." readOnly />
          </div>
        </div>

        <div className="right">
          <button className="icon-btn theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {!isLoggedIn ? (
            <>
              <button className="btn ghost" onClick={()=>nav('/register')}>Join Now</button>
              <button className="btn primary" onClick={()=>nav('/login')}>Login</button>
            </>
          ) : (
            <>
              <div className="wallet" onClick={()=>nav('/wallet')}>
                <FaWallet />
                <span className="wallet-amt">₦{Number(walletBalance||0).toLocaleString()}</span>
              </div>
              <button className="icon-btn" onClick={()=>nav('/notifications')}><FaBell /></button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}