import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, DollarSign, ChevronRight } from 'lucide-react';
import { ALL_PLAYERS } from '../data/allPlayers';
import CONTRACT_DATA from '../data/contracts.json';
import BIRTHDATE_DATA from '../data/birthdates.json';
import { POS_COLOR, POS_LABEL, POS_ORDER, STARTER_IDS } from '../lib/constants';
import { ageAsOf, fmtM } from '../lib/format';
import { useFilters } from '../context/FiltersContext';
import PlayerSearch from '../components/PlayerSearch';
import PosFilterChips from '../components/PosFilterChips';

const PREVIEW_SIZE = 5;

export default function Home() {
  const { posFilter, setPosFilter, mode } = useFilters();
  const navigate = useNavigate();

  const leaderboard = useMemo(() => {
    let list = ALL_PLAYERS;
    if (posFilter !== 'ALL') list = list.filter((p) => p.pos === posFilter);
    return [...list].sort((a, b) => b.career[mode] - a.career[mode]).slice(0, PREVIEW_SIZE);
  }, [posFilter, mode]);

  const expiringContracts = useMemo(() => {
    let list = ALL_PLAYERS.filter((p) => {
      const c = CONTRACT_DATA[p.id];
      return c && c.end === 2026;
    });
    if (posFilter !== 'ALL') list = list.filter((p) => p.pos === posFilter);
    return list
      .map((p) => ({
        ...p,
        contract: CONTRACT_DATA[p.id],
        age: ageAsOf(BIRTHDATE_DATA[p.id], '2026-09-01'),
      }))
      .sort((a, b) => {
        const posDiff = POS_ORDER[a.pos] - POS_ORDER[b.pos];
        if (posDiff !== 0) return posDiff;
        const ageA = a.age === null ? 999 : a.age;
        const ageB = b.age === null ? 999 : b.age;
        return ageA - ageB;
      })
      .slice(0, PREVIEW_SIZE);
  }, [posFilter]);

  return (
    <>
      <div className="nfa-eyebrow">1999 – 2025 · REG SEASON</div>
      <h1 className="nfa-title">FANTASY <span>YARDAGE</span></h1>
      <p className="nfa-sub">Season-by-season fantasy scoring for every notable QB, RB, WR &amp; TE from 1999 through the 2025 season. Pick a player to pull their file.</p>

      <div className="nfa-controls">
        <PlayerSearch players={ALL_PLAYERS} posFilter={posFilter} mode={mode} />
        <PosFilterChips value={posFilter} onChange={setPosFilter} />
      </div>

      <div className="nfa-board">
        <div className="nfa-board-head">
          <Trophy size={16} />
          Career Leaders {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
        </div>
        {leaderboard.map((p, idx) => (
          <div key={p.id} className="nfa-board-row" onClick={() => navigate(`/players/${p.id}`)}>
            <span className="nfa-rank">{idx + 1}</span>
            <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
            <span className="nfa-board-name">{p.name}</span>
            <span className="nfa-board-years">{p.first}–{p.last}</span>
            <span className="nfa-board-pts">{p.career[mode].toFixed(1)}</span>
            <ChevronRight className="nfa-board-arrow" />
          </div>
        ))}
      </div>
      <Link to="/leaders" className="nfa-section-more">View full leaderboard →</Link>

      {expiringContracts.length > 0 && (
        <>
          <div className="nfa-board nfa-expiring-board">
            <div className="nfa-board-head">
              <DollarSign size={16} />
              Contract Year Watch — 2026 {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
            </div>
            <p className="nfa-expiring-sub">Players entering the final year of their deal, or on a one-year contract, for the 2026 season — grouped by position, youngest first. <span className="nfa-starter-star">★</span> marks a current depth-chart starter.</p>
            {expiringContracts.map((p) => (
              <div key={p.id} className="nfa-board-row" onClick={() => navigate(`/players/${p.id}`)}>
                <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
                <span className="nfa-board-name">
                  {p.name}
                  {STARTER_IDS.has(p.id) && <span className="nfa-starter-star" title="Current starter">★</span>}
                </span>
                <span className="nfa-board-years">
                  {p.age !== null ? `Age ${p.age}` : 'Age —'} · {p.contract.years === 1 ? '1-yr deal' : `yr ${p.contract.years} of ${p.contract.years}`} · {p.contract.team}
                </span>
                <span className="nfa-board-pts">{p.contract.y2026 ? fmtM(p.contract.y2026.cap) : fmtM(p.contract.apy)}</span>
                <ChevronRight className="nfa-board-arrow" />
              </div>
            ))}
          </div>
          <Link to="/contracts" className="nfa-section-more">View full contract watch →</Link>
        </>
      )}
    </>
  );
}
