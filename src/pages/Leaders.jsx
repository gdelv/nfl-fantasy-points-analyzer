import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight } from 'lucide-react';
import { ALL_PLAYERS } from '../data/allPlayers';
import { POS_COLOR, POS_LABEL } from '../lib/constants';
import { useFilters } from '../context/FiltersContext';
import PlayerSearch from '../components/PlayerSearch';
import PosFilterChips from '../components/PosFilterChips';
import ModeToggle from '../components/ModeToggle';

const LEADERBOARD_SIZE = 25;

export default function Leaders() {
  const { posFilter, setPosFilter, mode, setMode } = useFilters();
  const navigate = useNavigate();

  const leaderboard = useMemo(() => {
    let list = ALL_PLAYERS;
    if (posFilter !== 'ALL') list = list.filter((p) => p.pos === posFilter);
    return [...list].sort((a, b) => b.career[mode] - a.career[mode]).slice(0, LEADERBOARD_SIZE);
  }, [posFilter, mode]);

  return (
    <>
      <div className="nfa-page-head">
        <h1 className="nfa-page-title">Career Leaders</h1>
        <p className="nfa-page-sub">Top {LEADERBOARD_SIZE} all-time fantasy scorers, 1999–2025.</p>
      </div>

      <div className="nfa-controls">
        <PlayerSearch players={ALL_PLAYERS} posFilter={posFilter} mode={mode} />
        <PosFilterChips value={posFilter} onChange={setPosFilter} />
      </div>

      <ModeToggle value={mode} onChange={setMode} />

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
    </>
  );
}
