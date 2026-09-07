import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ruler, ChevronRight } from 'lucide-react';
import { ALL_PLAYERS } from '../data/allPlayers';
import COMBINE_DATA from '../data/combine.json';
import { POS_COLOR, POS_LABEL, DRILLS } from '../lib/constants';
import { useFilters } from '../context/FiltersContext';
import PlayerSearch from '../components/PlayerSearch';
import PosFilterChips from '../components/PosFilterChips';

const LEADERBOARD_SIZE = 25;

export default function Combine() {
  const { posFilter, setPosFilter, mode } = useFilters();
  const navigate = useNavigate();
  const [drillKey, setDrillKey] = useState('forty');
  const drill = DRILLS.find((d) => d.key === drillKey);

  const leaderboard = useMemo(() => {
    let list = ALL_PLAYERS;
    if (posFilter !== 'ALL') list = list.filter((p) => p.pos === posFilter);
    return list
      .map((p) => {
        const combine = COMBINE_DATA[p.id];
        const raw = combine ? combine[drillKey] : null;
        if (!raw) return null;
        return { ...p, combine, value: drill.parse(raw), display: drill.format(raw) };
      })
      .filter(Boolean)
      .sort((a, b) => (drill.better === 'asc' ? a.value - b.value : b.value - a.value))
      .slice(0, LEADERBOARD_SIZE);
  }, [posFilter, drillKey, drill]);

  return (
    <>
      <div className="nfa-page-head">
        <h1 className="nfa-page-title">Combine Explorer</h1>
        <p className="nfa-page-sub">NFL Scouting Combine results, ranked by drill. Filter by position for an apples-to-apples comparison.</p>
      </div>

      <div className="nfa-controls">
        <PlayerSearch players={ALL_PLAYERS} posFilter={posFilter} mode={mode} />
        <PosFilterChips value={posFilter} onChange={setPosFilter} />
      </div>

      <div className="nfa-mode-row nfa-mode-row-wrap">
        {DRILLS.map((d) => (
          <button
            key={d.key}
            className={`nfa-mode-btn ${drillKey === d.key ? 'active' : ''}`}
            onClick={() => setDrillKey(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="nfa-board">
        <div className="nfa-board-head">
          <Ruler size={16} />
          {drill.label} {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : `· All Positions`}
        </div>
        {posFilter === 'ALL' && (
          <p className="nfa-expiring-sub">Comparing across positions — pick a position chip above for a like-for-like ranking.</p>
        )}
        {leaderboard.length === 0 && (
          <p className="nfa-injury-empty">No recorded {drill.label.toLowerCase()} results for this position.</p>
        )}
        {leaderboard.map((p, idx) => (
          <div key={p.id} className="nfa-board-row" onClick={() => navigate(`/players/${p.id}`)}>
            <span className="nfa-rank">{idx + 1}</span>
            <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
            <span className="nfa-board-name">{p.name}</span>
            <span className="nfa-board-years">
              {p.combine.school || '—'}{p.combine.dyear ? ` · ${p.combine.dyear}` : ''}
            </span>
            <span className="nfa-board-pts">{p.display}</span>
            <ChevronRight className="nfa-board-arrow" />
          </div>
        ))}
      </div>
    </>
  );
}
