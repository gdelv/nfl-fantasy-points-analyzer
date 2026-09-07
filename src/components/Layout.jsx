import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import GlobalStyle from './GlobalStyle';

export default function Layout() {
  return (
    <div className="nfa-root">
      <GlobalStyle />
      <div className="nfa-wrap">
        <nav className="nfa-nav">
          <NavLink to="/" end className="nfa-nav-brand">
            FANTASY <span>YARDAGE</span>
          </NavLink>
          <NavLink to="/" end className={({ isActive }) => `nfa-nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/leaders" className={({ isActive }) => `nfa-nav-link ${isActive ? 'active' : ''}`}>Leaders</NavLink>
          <NavLink to="/contracts" className={({ isActive }) => `nfa-nav-link ${isActive ? 'active' : ''}`}>Contracts</NavLink>
        </nav>

        <Outlet />

        <p className="nfa-footnote">
          Data: nflverse season-level player stats, weekly injury reports, and OverTheCap.com contract data (via nflverse). Scoring covers 1999–2025, injury reports 2009–2025. Games-missed counts are inferred from "Out" designations on the weekly injury report, not confirmed absences. Contract figures are current as of this data pull and reflect the contract on file, which may lag a very recent signing, trade, or restructure.
        </p>
      </div>
    </div>
  );
}
