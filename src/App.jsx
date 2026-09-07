import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Search, X, Trophy, ChevronRight, Flame, Activity, DollarSign } from 'lucide-react';

import PLAYER_DATA from './data/players.json';
import INJURY_DATA from './data/injuries.json';
import CONTRACT_DATA from './data/contracts.json';
import BIRTHDATE_DATA from './data/birthdates.json';
import STARTER_IDS_ARR from './data/starters.json';
import COMBINE_DATA from './data/combine.json';
import RANK_DATA from './data/ranks.json';

const STARTER_IDS = new Set(STARTER_IDS_ARR);

const POS_ORDER = { QB: 0, RB: 1, WR: 2, TE: 3 };

function ageAsOf(birthDateStr, refDateStr) {
  if (!birthDateStr) return null;
  const b = new Date(birthDateStr);
  const ref = new Date(refDateStr);
  let age = ref.getFullYear() - b.getFullYear();
  const m = ref.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) age -= 1;
  return age;
}

const POS_COLOR = {
  QB: '#F5B700',
  RB: '#57B8A2',
  WR: '#E0663D',
  TE: '#6C8FC7',
};

// Approximate marker positions for a simple front-view body silhouette, viewBox 0 0 200 440
const BODY_POINTS = {
  Head: { x: 100, y: 30 },
  Neck: { x: 100, y: 57 },
  Shoulder: { x: 137, y: 82 },
  Chest: { x: 100, y: 106 },
  Ribs: { x: 122, y: 128 },
  Back: { x: 68, y: 118 },
  Abdomen: { x: 100, y: 150 },
  Hip: { x: 119, y: 174 },
  Groin: { x: 100, y: 190 },
  Forearm: { x: 156, y: 178 },
  Elbow: { x: 150, y: 148 },
  'Hand/Wrist': { x: 161, y: 206 },
  Thigh: { x: 115, y: 230 },
  Hamstring: { x: 85, y: 230 },
  Knee: { x: 115, y: 278 },
  Calf: { x: 115, y: 322 },
  Achilles: { x: 85, y: 368 },
  Ankle: { x: 115, y: 362 },
  Foot: { x: 115, y: 388 },
};

const STATUS_COLOR = {
  Out: '#C0392B',
  Doubtful: '#E0663D',
  Questionable: '#F5B700',
};

function fmtM(v) {
  if (v === null || v === undefined) return '—';
  return `$${v.toFixed(1)}M`;
}

const POS_LABEL = {
  QB: 'Quarterback',
  RB: 'Running Back',
  WR: 'Wide Receiver',
  TE: 'Tight End',
};

const MODES = [
  { key: 'std', label: 'Standard' },
  { key: 'h', label: 'Half-PPR' },
  { key: 'ppr', label: 'Full PPR' },
];

function pts(row, mode) {
  return row[mode];
}

function statLine(row, pos) {
  if (pos === 'QB') {
    const bits = [`${row.py.toLocaleString()} PASS YD`, `${row.ptd} TD`, `${row.int} INT`];
    if (row.ry) bits.push(`${row.ry} RUSH YD`);
    return bits.join(' · ');
  }
  if (pos === 'RB') {
    const bits = [`${row.ry.toLocaleString()} RUSH YD`, `${row.rtd} TD`];
    if (row.rec) bits.push(`${row.rec} REC`, `${row.recy.toLocaleString()} REC YD`);
    return bits.join(' · ');
  }
  const bits = [`${row.rec} REC`, `${row.recy.toLocaleString()} YD`, `${row.rectd} TD`];
  if (row.ry) bits.push(`${row.ry} RUSH YD`);
  return bits.join(' · ');
}

function statColumns(pos) {
  if (pos === 'QB') {
    return [
      { key: 'py', label: 'PASS YD' },
      { key: 'ptd', label: 'PASS TD' },
      { key: 'int', label: 'INT' },
      { key: 'ry', label: 'RUSH YD' },
      { key: 'rtd', label: 'RUSH TD' },
    ];
  }
  if (pos === 'RB') {
    return [
      { key: 'ry', label: 'RUSH YD' },
      { key: 'rtd', label: 'RUSH TD' },
      { key: 'rec', label: 'REC' },
      { key: 'recy', label: 'REC YD' },
      { key: 'rectd', label: 'REC TD' },
    ];
  }
  return [
    { key: 'rec', label: 'REC' },
    { key: 'recy', label: 'REC YD' },
    { key: 'rectd', label: 'REC TD' },
    { key: 'ry', label: 'RUSH YD' },
    { key: 'rtd', label: 'RUSH TD' },
  ];
}

function CustomTooltip({ active, payload, pos, modeLabel }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div className="nfa-tooltip">
      <div className="nfa-tooltip-head">
        <span className="nfa-tooltip-season">{row.s}</span>
        <span className="nfa-tooltip-team">{row.tm}</span>
      </div>
      <div className="nfa-tooltip-pts">{pts(row, payload[0].dataKey).toFixed(1)} <small>{modeLabel} PTS</small></div>
      <div className="nfa-tooltip-stats">{statLine(row, pos)}</div>
      <div className="nfa-tooltip-gp">{row.g} games played</div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [mode, setMode] = useState('h');
  const [selectedId, setSelectedId] = useState(null);
  const [focused, setFocused] = useState(false);
  const [activeBodyPart, setActiveBodyPart] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const players = useMemo(() => {
    return Object.entries(PLAYER_DATA).map(([id, p]) => {
      const teams = [...new Set(p.seasons.map((s) => s.tm).filter(Boolean))];
      const careerStd = p.seasons.reduce((a, s) => a + s.std, 0);
      const careerH = p.seasons.reduce((a, s) => a + s.h, 0);
      const careerPpr = p.seasons.reduce((a, s) => a + s.ppr, 0);
      const gp = p.seasons.reduce((a, s) => a + s.g, 0);
      const first = p.seasons[0].s;
      const last = p.seasons[p.seasons.length - 1].s;
      return {
        id, name: p.name, pos: p.pos, teams, gp, first, last,
        seasons: p.seasons,
        career: { std: careerStd, h: careerH, ppr: careerPpr },
      };
    });
  }, []);

  const searchResults = useMemo(() => {
    let list = players;
    if (posFilter !== 'ALL') list = list.filter((p) => p.pos === posFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.career[mode] - a.career[mode]).slice(0, 40);
  }, [players, query, posFilter, mode]);

  const leaderboard = useMemo(() => {
    let list = players;
    if (posFilter !== 'ALL') list = list.filter((p) => p.pos === posFilter);
    return [...list].sort((a, b) => b.career[mode] - a.career[mode]).slice(0, 10);
  }, [players, posFilter, mode]);

  const expiringContracts = useMemo(() => {
    let list = players.filter((p) => {
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
      });
  }, [players, posFilter]);

  const selected = selectedId ? players.find((p) => p.id === selectedId) : null;

  const modeLabel = MODES.find((m) => m.key === mode).label;

  const bestSeason = selected
    ? [...selected.seasons].sort((a, b) => pts(b, mode) - pts(a, mode))[0]
    : null;
  const careerAvg = selected ? selected.career[mode] / selected.seasons.length : 0;
  const ppg = selected && selected.gp ? selected.career[mode] / selected.gp : 0;

  const tableSeasons = selected ? [...selected.seasons].reverse() : [];

  const injurySpells = selected ? (INJURY_DATA[selected.id] || []) : [];
  const contract = selected ? (CONTRACT_DATA[selected.id] || null) : null;
  const combine = selected ? (COMBINE_DATA[selected.id] || null) : null;
  const ranks = selected ? (RANK_DATA[selected.id] || {}) : {};

  const bodyPartSummary = useMemo(() => {
    const map = {};
    injurySpells.forEach((s) => {
      if (!map[s.bp]) map[s.bp] = { bp: s.bp, count: 0, missed: 0 };
      map[s.bp].count += 1;
      map[s.bp].missed += s.missed;
    });
    return Object.values(map).sort((a, b) => b.missed - a.missed || b.count - a.count);
  }, [injurySpells]);

  const totalMissed = injurySpells.reduce((a, s) => a + s.missed, 0);
  const topBodyPart = bodyPartSummary[0];

  const filteredSpells = [...injurySpells]
    .filter((s) => !activeBodyPart || s.bp === activeBodyPart)
    .sort((a, b) => b.season - a.season || b.w1 - a.w1);

  function pick(id) {
    setSelectedId(id);
    setQuery('');
    setFocused(false);
    setActiveBodyPart(null);
  }

  return (
    <div className="nfa-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

        .nfa-root {
          --bg: #0A0E13;
          --panel: #121821;
          --panel-2: #171F2A;
          --turf: #0E2A1F;
          --turf-2: #123424;
          --chalk: #ECEFEA;
          --gold: #F5B700;
          --text: #EDF2F0;
          --text-muted: #7E8C93;
          --border: #22303C;
          --red: #C0392B;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100%;
          padding: 24px 20px 60px;
          box-sizing: border-box;
        }
        .nfa-root * { box-sizing: border-box; }
        .nfa-wrap { max-width: 980px; margin: 0 auto; }

        .nfa-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .nfa-title {
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 5vw, 42px);
          text-transform: uppercase;
          letter-spacing: 0.01em;
          margin: 0 0 4px;
          line-height: 1.05;
        }
        .nfa-title span { color: var(--gold); }
        .nfa-sub {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0 0 24px;
        }

        .nfa-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 18px;
        }
        .nfa-search {
          position: relative;
          flex: 1 1 280px;
          min-width: 220px;
        }
        .nfa-search-input {
          width: 100%;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px 11px 38px;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .nfa-search-input:focus { border-color: var(--gold); }
        .nfa-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          width: 16px;
          height: 16px;
          pointer-events: none;
        }
        .nfa-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
        }
        .nfa-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--panel-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          max-height: 340px;
          overflow-y: auto;
          z-index: 20;
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        }
        .nfa-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
        }
        .nfa-dropdown-item:last-child { border-bottom: none; }
        .nfa-dropdown-item:hover { background: rgba(245,183,0,0.08); }
        .nfa-pos-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          color: #0A0E13;
          flex-shrink: 0;
          min-width: 28px;
          text-align: center;
        }
        .nfa-dd-name { font-size: 13.5px; font-weight: 500; flex: 1; }
        .nfa-dd-meta { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        .nfa-pos-filters { display: flex; gap: 6px; }
        .nfa-pos-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--panel);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }
        .nfa-pos-chip.active { background: var(--gold); color: #0A0E13; border-color: var(--gold); }
        .nfa-pos-chip:hover:not(.active) { border-color: var(--gold); color: var(--text); }

        .nfa-mode-row { display: flex; gap: 6px; margin-bottom: 22px; }
        .nfa-mode-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 7px 13px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }
        .nfa-mode-btn.active { background: var(--chalk); color: #0A0E13; border-color: var(--chalk); }

        /* leaderboard (empty state) */
        .nfa-board {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .nfa-board-head {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border);
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 15px;
          color: var(--gold);
        }
        .nfa-board-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.12s;
        }
        .nfa-board-row:last-child { border-bottom: none; }
        .nfa-board-row:hover { background: rgba(245,183,0,0.06); }
        .nfa-rank {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--text-muted);
          width: 20px;
        }
        .nfa-board-name { font-weight: 600; font-size: 14.5px; flex: 1; }
        .nfa-starter-star { color: var(--gold); margin-left: 6px; font-size: 12px; }
        .nfa-board-years { font-size: 11.5px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
        .nfa-board-pts {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: var(--gold);
          font-size: 14px;
          min-width: 70px;
          text-align: right;
        }
        .nfa-board-arrow { color: var(--text-muted); width: 16px; height: 16px; flex-shrink: 0; }
        .nfa-expiring-board { margin-top: 18px; }
        .nfa-expiring-sub {
          font-size: 12px;
          color: var(--text-muted);
          padding: 10px 18px;
          border-bottom: 1px solid var(--border);
          line-height: 1.5;
        }

        /* selected player */
        .nfa-player-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .nfa-player-name {
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: clamp(24px, 4vw, 34px);
          text-transform: uppercase;
          margin: 0 0 4px;
        }
        .nfa-player-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nfa-player-pos-badge {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 12px;
          padding: 3px 9px;
          border-radius: 5px;
          color: #0A0E13;
        }
        .nfa-back-btn {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text-muted);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12.5px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
        }
        .nfa-back-btn:hover { color: var(--text); border-color: var(--gold); }

        .nfa-combine-strip {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
          padding: 12px 16px;
          margin-bottom: 18px;
        }
        .nfa-combine-draft {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .nfa-combine-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }
        .nfa-combine-cell {
          display: flex;
          flex-direction: column;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--chalk);
        }
        .nfa-combine-cell span {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        .nfa-combine-cell em {
          font-style: normal;
          font-size: 10px;
          font-weight: 600;
          color: var(--gold);
          margin-top: 2px;
        }
        .nfa-combine-hint {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 10px;
        }

        .nfa-scoreboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        .nfa-sb-cell {
          background: #060907;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
        }
        .nfa-sb-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .nfa-sb-value {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 22px;
          color: var(--gold);
          letter-spacing: 0.02em;
        }
        .nfa-sb-value small { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-left: 3px; }

        .nfa-chart-card {
          border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 22px;
        }
        .nfa-chart-header {
          background: var(--panel);
          padding: 12px 18px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        .nfa-turf {
          background:
            repeating-linear-gradient(90deg, var(--turf-2) 0px, var(--turf-2) 40px, var(--turf) 40px, var(--turf) 80px);
          padding: 18px 10px 6px;
          position: relative;
        }
        .nfa-turf::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 6px;
          background: repeating-linear-gradient(90deg, var(--chalk) 0px, var(--chalk) 2px, transparent 2px, transparent 16px);
          opacity: 0.35;
        }

        .nfa-tooltip {
          background: #060907;
          border: 1px solid var(--gold);
          border-radius: 8px;
          padding: 10px 12px;
          font-family: 'JetBrains Mono', monospace;
          min-width: 170px;
        }
        .nfa-tooltip-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .nfa-tooltip-season { font-weight: 700; font-size: 13px; color: var(--chalk); }
        .nfa-tooltip-team { font-size: 11px; color: var(--text-muted); }
        .nfa-tooltip-pts { font-size: 18px; font-weight: 700; color: var(--gold); margin-bottom: 4px; }
        .nfa-tooltip-pts small { font-size: 9.5px; color: var(--text-muted); font-weight: 500; }
        .nfa-tooltip-stats { font-size: 10.5px; color: var(--text); line-height: 1.5; margin-bottom: 3px; }
        .nfa-tooltip-gp { font-size: 10px; color: var(--text-muted); }

        .nfa-table-wrap {
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .nfa-table-scroll { overflow-x: auto; }
        table.nfa-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; min-width: 640px; }
        table.nfa-table thead th {
          text-align: right;
          padding: 10px 12px;
          background: var(--panel);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.06em;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        table.nfa-table thead th:first-child, table.nfa-table thead th:nth-child(2) { text-align: left; }
        table.nfa-table tbody td {
          text-align: right;
          padding: 9px 12px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        table.nfa-table tbody td:first-child, table.nfa-table tbody td:nth-child(2) { text-align: left; }
        table.nfa-table tbody tr:last-child td { border-bottom: none; }
        table.nfa-table tbody tr:hover { background: rgba(245,183,0,0.05); }
        table.nfa-table .nfa-pts-cell { color: var(--gold); font-weight: 700; }
        .nfa-table-title {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 14px;
          padding: 14px 18px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          color: var(--gold);
        }

        .nfa-injury-card {
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-top: 22px;
        }
        .nfa-injury-empty {
          padding: 18px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .nfa-injury-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          padding: 16px 18px 0;
        }
        .nfa-injury-body {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 18px;
          padding: 18px;
        }
        .nfa-body-diagram {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .nfa-body-svg {
          width: 100%;
          max-width: 210px;
          height: auto;
        }
        .nfa-body-shape {
          fill: rgba(236,239,234,0.07);
          stroke: rgba(236,239,234,0.22);
          stroke-width: 1.5;
        }
        .nfa-body-limb {
          stroke: rgba(236,239,234,0.22);
          stroke-width: 13;
          stroke-linecap: round;
          fill: rgba(236,239,234,0.07);
        }
        .nfa-body-limb-thick {
          stroke: rgba(236,239,234,0.22);
          stroke-width: 20;
          stroke-linecap: round;
          fill: rgba(236,239,234,0.07);
        }
        .nfa-marker-group { cursor: pointer; }
        .nfa-marker-dot { transition: r 0.15s; }
        .nfa-body-hint {
          font-size: 10px;
          color: var(--text-muted);
          text-align: center;
          margin: 10px 0 0;
          line-height: 1.5;
        }
        .nfa-injury-list-wrap { min-width: 0; }
        .nfa-bp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .nfa-injury-log {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 420px;
          overflow-y: auto;
        }
        .nfa-injury-row {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 9px 12px;
        }
        .nfa-injury-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .nfa-injury-bp {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
        }
        .nfa-injury-status {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 7px;
          border: 1px solid;
          border-radius: 999px;
        }
        .nfa-injury-row-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .nfa-injury-body { grid-template-columns: 1fr; }
        }

        .nfa-contract-card {
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-top: 22px;
        }
        .nfa-contract-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 16px 18px 12px;
        }
        .nfa-contract-team {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-size: 17px;
          color: var(--chalk);
        }
        .nfa-contract-span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .nfa-contract-remaining {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--gold);
          background: rgba(245,183,0,0.1);
          border: 1px solid rgba(245,183,0,0.35);
          border-radius: 999px;
          padding: 5px 12px;
          white-space: nowrap;
        }
        .nfa-contract-2026 {
          margin-top: 4px;
          padding-bottom: 18px;
        }
        .nfa-contract-2026-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 10px 18px 8px;
        }

        .nfa-footnote {
          margin-top: 18px;
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        @media (max-width: 560px) {
          .nfa-scoreboard { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="nfa-wrap">
        <div className="nfa-eyebrow">1999 – 2025 · REG SEASON</div>
        <h1 className="nfa-title">FANTASY <span>YARDAGE</span></h1>
        <p className="nfa-sub">Season-by-season fantasy scoring for every notable QB, RB, WR &amp; TE from 1999 through the 2025 season. Pick a player to pull their file.</p>

        <div className="nfa-controls">
          <div className="nfa-search" ref={boxRef}>
            <Search className="nfa-search-icon" />
            <input
              className="nfa-search-input"
              placeholder="Search a player…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
            />
            {query && (
              <button className="nfa-search-clear" onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            )}
            {focused && query.trim() && (
              <div className="nfa-dropdown">
                {searchResults.length === 0 && (
                  <div className="nfa-dropdown-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>No players found</div>
                )}
                {searchResults.map((p) => (
                  <div key={p.id} className="nfa-dropdown-item" onClick={() => pick(p.id)}>
                    <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
                    <span className="nfa-dd-name">{p.name}</span>
                    <span className="nfa-dd-meta">{p.first}–{p.last}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="nfa-pos-filters">
            {['ALL', 'QB', 'RB', 'WR', 'TE'].map((pos) => (
              <button
                key={pos}
                className={`nfa-pos-chip ${posFilter === pos ? 'active' : ''}`}
                onClick={() => setPosFilter(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        <div className="nfa-mode-row">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`nfa-mode-btn ${mode === m.key ? 'active' : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!selected && (
          <div className="nfa-board">
            <div className="nfa-board-head">
              <Trophy size={16} />
              Career Leaders {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
            </div>
            {leaderboard.map((p, idx) => (
              <div key={p.id} className="nfa-board-row" onClick={() => pick(p.id)}>
                <span className="nfa-rank">{idx + 1}</span>
                <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
                <span className="nfa-board-name">{p.name}</span>
                <span className="nfa-board-years">{p.first}–{p.last}</span>
                <span className="nfa-board-pts">{p.career[mode].toFixed(1)}</span>
                <ChevronRight className="nfa-board-arrow" />
              </div>
            ))}
          </div>
        )}

        {!selected && expiringContracts.length > 0 && (
          <div className="nfa-board nfa-expiring-board">
            <div className="nfa-board-head">
              <DollarSign size={16} />
              Contract Year Watch — 2026 {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
            </div>
            <p className="nfa-expiring-sub">Players entering the final year of their deal, or on a one-year contract, for the 2026 season — grouped by position, youngest first. <span className="nfa-starter-star">★</span> marks a current depth-chart starter.</p>
            {expiringContracts.map((p) => (
              <div key={p.id} className="nfa-board-row" onClick={() => pick(p.id)}>
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
        )}

        {selected && (
          <>
            <div className="nfa-player-head">
              <div>
                <h2 className="nfa-player-name">{selected.name}</h2>
                <div className="nfa-player-meta">
                  <span className="nfa-player-pos-badge" style={{ background: POS_COLOR[selected.pos] }}>{selected.pos}</span>
                  <span>{selected.teams.join(', ')}</span>
                  <span>·</span>
                  <span>{selected.first}–{selected.last}</span>
                </div>
              </div>
              <button className="nfa-back-btn" onClick={() => setSelectedId(null)}>← Back to leaders</button>
            </div>

            {combine && (
              <div className="nfa-combine-strip">
                <div className="nfa-combine-draft">
                  {combine.dround ? `Rd ${combine.dround}, Pick ${combine.dovr} (${combine.dyear})` : combine.dyear ? `${combine.dyear} · Undrafted` : ''}
                  {combine.dteam ? ` · ${combine.dteam}` : ''}
                  {combine.school ? ` · ${combine.school}` : ''}
                </div>
                <div className="nfa-combine-metrics">
                  {combine.ht && <div className="nfa-combine-cell"><span>HT</span>{combine.ht}{ranks.ht && <em>{ranks.ht[0]}/{ranks.ht[1]}</em>}</div>}
                  {combine.wt && <div className="nfa-combine-cell"><span>WT</span>{combine.wt} lb{ranks.wt && <em>{ranks.wt[0]}/{ranks.wt[1]}</em>}</div>}
                  {combine.forty && <div className="nfa-combine-cell"><span>40 YD</span>{combine.forty}s{ranks.forty && <em>{ranks.forty[0]}/{ranks.forty[1]}</em>}</div>}
                  {combine.bench && <div className="nfa-combine-cell"><span>BENCH</span>{combine.bench} reps{ranks.bench && <em>{ranks.bench[0]}/{ranks.bench[1]}</em>}</div>}
                  {combine.vert && <div className="nfa-combine-cell"><span>VERT</span>{combine.vert}"{ranks.vert && <em>{ranks.vert[0]}/{ranks.vert[1]}</em>}</div>}
                  {combine.broad && <div className="nfa-combine-cell"><span>BROAD</span>{combine.broad}"{ranks.broad && <em>{ranks.broad[0]}/{ranks.broad[1]}</em>}</div>}
                  {combine.cone && <div className="nfa-combine-cell"><span>3-CONE</span>{combine.cone}s{ranks.cone && <em>{ranks.cone[0]}/{ranks.cone[1]}</em>}</div>}
                  {combine.shuttle && <div className="nfa-combine-cell"><span>SHUTTLE</span>{combine.shuttle}s{ranks.shuttle && <em>{ranks.shuttle[0]}/{ranks.shuttle[1]}</em>}</div>}
                </div>
                <div className="nfa-combine-hint">Rank = among {selected.pos}s with that drill recorded · 1 is best</div>
              </div>
            )}

            <div className="nfa-scoreboard">
              <div className="nfa-sb-cell">
                <div className="nfa-sb-label">Career Total</div>
                <div className="nfa-sb-value">{selected.career[mode].toFixed(0)}<small>pts</small></div>
              </div>
              <div className="nfa-sb-cell">
                <div className="nfa-sb-label">Best Season</div>
                <div className="nfa-sb-value">{bestSeason.s}<small>{pts(bestSeason, mode).toFixed(0)} pts</small></div>
              </div>
              <div className="nfa-sb-cell">
                <div className="nfa-sb-label">Pts / Game</div>
                <div className="nfa-sb-value">{ppg.toFixed(1)}</div>
              </div>
              <div className="nfa-sb-cell">
                <div className="nfa-sb-label">Seasons</div>
                <div className="nfa-sb-value">{selected.seasons.length}</div>
              </div>
            </div>

            <div className="nfa-chart-card">
              <div className="nfa-chart-header">{modeLabel} points by season</div>
              <div className="nfa-turf">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selected.seasons} margin={{ top: 18, right: 12, left: -12, bottom: 4 }}>
                    <XAxis
                      dataKey="s"
                      tick={{ fill: '#ECEFEA', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(236,239,234,0.25)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(236,239,234,0.55)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <ReferenceLine y={careerAvg} stroke="#F5B700" strokeDasharray="4 4" strokeOpacity={0.6} />
                    <Tooltip content={<CustomTooltip pos={selected.pos} modeLabel={modeLabel} />} cursor={{ fill: 'rgba(236,239,234,0.06)' }} />
                    <Bar dataKey={mode} radius={[4, 4, 0, 0]} maxBarSize={38}>
                      {selected.seasons.map((s, i) => (
                        <Cell key={i} fill={s.s === bestSeason.s ? '#F5B700' : POS_COLOR[selected.pos]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="nfa-table-wrap">
              <div className="nfa-table-title">Season log</div>
              <div className="nfa-table-scroll">
                <table className="nfa-table">
                  <thead>
                    <tr>
                      <th>Season</th>
                      <th>Team</th>
                      <th>GP</th>
                      <th>PTS</th>
                      <th>PPG</th>
                      {statColumns(selected.pos).map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableSeasons.map((row) => (
                      <tr key={row.s}>
                        <td>{row.s}</td>
                        <td>{row.tm}</td>
                        <td>{row.g}</td>
                        <td className="nfa-pts-cell">{pts(row, mode).toFixed(1)}</td>
                        <td>{row.g ? (pts(row, mode) / row.g).toFixed(1) : '0.0'}</td>
                        {statColumns(selected.pos).map((c) => (
                          <td key={c.key}>{row[c.key].toLocaleString()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="nfa-injury-card">
              <div className="nfa-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={15} />
                Injury report {injurySpells.length > 0 ? `· ${injurySpells.length} logged event${injurySpells.length === 1 ? '' : 's'}` : ''}
              </div>

              {injurySpells.length === 0 && (
                <p className="nfa-injury-empty">
                  No injury-report entries for {selected.name} in the tracked data (official weekly injury reports are only available from 2009 onward).
                </p>
              )}

              {injurySpells.length > 0 && (
                <>
                  <div className="nfa-injury-summary">
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Games Missed</div>
                      <div className="nfa-sb-value">{totalMissed}<small>per report</small></div>
                    </div>
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Most Reported</div>
                      <div className="nfa-sb-value" style={{ fontSize: 18 }}>{topBodyPart ? topBodyPart.bp : '—'}</div>
                    </div>
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Body Parts</div>
                      <div className="nfa-sb-value">{bodyPartSummary.length}</div>
                    </div>
                  </div>

                  <div className="nfa-injury-body">
                    <div className="nfa-body-diagram">
                      <svg viewBox="0 0 200 440" className="nfa-body-svg">
                        <circle cx="100" cy="30" r="20" className="nfa-body-shape" />
                        <rect x="90" y="47" width="20" height="15" rx="6" className="nfa-body-shape" />
                        <path d="M60,64 Q100,56 140,64 L150,150 Q100,166 50,150 Z" className="nfa-body-shape" />
                        <path d="M55,150 Q100,168 145,150 L138,192 Q100,203 62,192 Z" className="nfa-body-shape" />
                        <line x1="63" y1="76" x2="38" y2="203" className="nfa-body-limb" />
                        <line x1="137" y1="76" x2="162" y2="203" className="nfa-body-limb" />
                        <line x1="85" y1="196" x2="85" y2="398" className="nfa-body-limb-thick" />
                        <line x1="115" y1="196" x2="115" y2="398" className="nfa-body-limb-thick" />
                        <ellipse cx="38" cy="208" rx="9" ry="7" className="nfa-body-shape" />
                        <ellipse cx="162" cy="208" rx="9" ry="7" className="nfa-body-shape" />
                        <ellipse cx="85" cy="405" rx="11" ry="7" className="nfa-body-shape" />
                        <ellipse cx="115" cy="405" rx="11" ry="7" className="nfa-body-shape" />

                        {bodyPartSummary.map((b) => {
                          const p = BODY_POINTS[b.bp];
                          if (!p) return null;
                          const r = 7 + Math.min(b.count, 6) * 1.6;
                          const active = activeBodyPart === b.bp;
                          return (
                            <g
                              key={b.bp}
                              className="nfa-marker-group"
                              onClick={() => setActiveBodyPart(active ? null : b.bp)}
                            >
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={r}
                                className="nfa-marker-pulse"
                                fill={b.missed > 0 ? '#C0392B' : '#F5B700'}
                                opacity={active ? 0.35 : 0.18}
                              />
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={Math.max(5, r - 4)}
                                fill={b.missed > 0 ? '#C0392B' : '#F5B700'}
                                stroke={active ? '#ECEFEA' : 'none'}
                                strokeWidth="2"
                                className="nfa-marker-dot"
                              />
                            </g>
                          );
                        })}
                      </svg>
                      <p className="nfa-body-hint">Tap a marker to filter the log · gold = no games missed, red = games missed</p>
                    </div>

                    <div className="nfa-injury-list-wrap">
                      <div className="nfa-bp-chips">
                        <button
                          className={`nfa-pos-chip ${!activeBodyPart ? 'active' : ''}`}
                          onClick={() => setActiveBodyPart(null)}
                        >
                          ALL
                        </button>
                        {bodyPartSummary.map((b) => (
                          <button
                            key={b.bp}
                            className={`nfa-pos-chip ${activeBodyPart === b.bp ? 'active' : ''}`}
                            onClick={() => setActiveBodyPart(activeBodyPart === b.bp ? null : b.bp)}
                          >
                            {b.bp} ({b.count})
                          </button>
                        ))}
                      </div>

                      <div className="nfa-injury-log">
                        {filteredSpells.map((s, i) => (
                          <div className="nfa-injury-row" key={i}>
                            <div className="nfa-injury-row-top">
                              <span className="nfa-injury-bp">{s.raw}</span>
                              <span
                                className="nfa-injury-status"
                                style={{ color: STATUS_COLOR[s.status] || '#7E8C93', borderColor: STATUS_COLOR[s.status] || '#22303C' }}
                              >
                                {s.status}
                              </span>
                            </div>
                            <div className="nfa-injury-row-meta">
                              <span>{s.date ? s.date : `${s.season} · Wk ${s.w1}${s.w2 !== s.w1 ? `–${s.w2}` : ''}`}</span>
                              <span>·</span>
                              <span>{s.team}</span>
                              <span>·</span>
                              <span>{s.missed} game{s.missed === 1 ? '' : 's'} missed</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="nfa-contract-card">
              <div className="nfa-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={15} />
                2026 Contract
              </div>

              {!contract && (
                <p className="nfa-injury-empty">
                  No active 2026 contract on file for {selected.name}
                  {selected.last < 2025 ? ' — likely retired or out of the league.' : ' — could be a free agent, a not-yet-logged rookie deal, or simply missing from the source data.'}
                </p>
              )}

              {contract && (
                <>
                  <div className="nfa-contract-top">
                    <div>
                      <div className="nfa-contract-team">{contract.team}</div>
                      <div className="nfa-contract-span">
                        Signed {contract.signed} · {contract.years}-year deal · through {contract.end}
                      </div>
                    </div>
                    <div className="nfa-contract-remaining">
                      {contract.end - 2026 > 0
                        ? `${contract.end - 2026} yr${contract.end - 2026 === 1 ? '' : 's'} left after 2026`
                        : contract.end === 2026
                        ? 'Final year: 2026'
                        : 'Contract on file has expired'}
                    </div>
                  </div>

                  <div className="nfa-scoreboard" style={{ padding: '0 18px 4px' }}>
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Total Value</div>
                      <div className="nfa-sb-value">{fmtM(contract.value)}</div>
                    </div>
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Avg / Year</div>
                      <div className="nfa-sb-value">{fmtM(contract.apy)}</div>
                    </div>
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Guaranteed</div>
                      <div className="nfa-sb-value">{fmtM(contract.gtd)}</div>
                    </div>
                    <div className="nfa-sb-cell">
                      <div className="nfa-sb-label">Cap % at Signing</div>
                      <div className="nfa-sb-value">{contract.cap_pct !== null ? `${contract.cap_pct}%` : '—'}</div>
                    </div>
                  </div>

                  {contract.y2026 && (
                    <div className="nfa-contract-2026">
                      <div className="nfa-contract-2026-label">2026 season breakdown</div>
                      <div className="nfa-scoreboard">
                        <div className="nfa-sb-cell">
                          <div className="nfa-sb-label">Base Salary</div>
                          <div className="nfa-sb-value">{fmtM(contract.y2026.base)}</div>
                        </div>
                        <div className="nfa-sb-cell">
                          <div className="nfa-sb-label">Cap Number</div>
                          <div className="nfa-sb-value">{fmtM(contract.y2026.cap)}</div>
                        </div>
                        <div className="nfa-sb-cell">
                          <div className="nfa-sb-label">Cap %</div>
                          <div className="nfa-sb-value">{contract.y2026.cap_pct !== null ? `${contract.y2026.cap_pct}%` : '—'}</div>
                        </div>
                        <div className="nfa-sb-cell">
                          <div className="nfa-sb-label">Guaranteed (yr)</div>
                          <div className="nfa-sb-value">{fmtM(contract.y2026.guaranteed)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <p className="nfa-footnote">
          Data: nflverse season-level player stats, weekly injury reports, and OverTheCap.com contract data (via nflverse). Scoring covers 1999–2025, injury reports 2009–2025. Games-missed counts are inferred from "Out" designations on the weekly injury report, not confirmed absences. Contract figures are current as of this data pull and reflect the contract on file, which may lag a very recent signing, trade, or restructure.
        </p>
      </div>
    </div>
  );
}
