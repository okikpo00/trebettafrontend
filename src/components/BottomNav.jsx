import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaWallet, FaUser } from 'react-icons/fa';
import '../css/bottomnav.css';

export default function BottomNav(){
  const nav = useNavigate();
  return (
    <nav className="bottom-nav">
      <div className="bottom-inner container">
        <NavLink to="/home" className="nav-item"><FaHome /><span>Home</span></NavLink>
        <NavLink to="/mypools" className="nav-item"><FaList /><span>My Pools</span></NavLink>
        <NavLink to="/wallet" className="nav-item"><FaWallet /><span>Wallet</span></NavLink>
        <NavLink to="/profile" className="nav-item"><FaUser /><span>Profile</span></NavLink>
      </div>
    </nav>
  )
}