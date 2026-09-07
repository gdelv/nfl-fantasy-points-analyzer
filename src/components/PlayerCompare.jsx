import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Search, X } from 'lucide-react';
import { POS_COLOR, COMPARE_COLORS } from '../lib/constants';
import { pts } from '../lib/format';

const MAX_COMPARES = 4;

function defaultComps(selected, allPlayers, mode) {
  return allPlayers
    .filter((p) => p.pos === selected.pos && p.id !== selected.id)
    .sort((a, b) => Math.abs(a.career[mode] - selected.career[mode]) - Math.abs(b.career[mode] - selected.career[mode]))
    .slice(0, 2)
    .map((p) => p.id);
}

function CompareTooltip({ active, payload, label, colorById, nameById, modeLabel }) {
  if (!active || !payload || !payload.length) return null;
  const rows = payload.filter((p) => p.value !== null && p.value !== undefined);
  if (!rows.length) return null;
  return (
    <div className="nfa-tooltip">
      <div className="nfa-tooltip-head">
        <span className="nfa-tooltip-season">Year {label}</span>
      </div>
      {rows
        .sort((a, b) => b.value - a.value)
        .map((r) => (
          <div key={r.dataKey} className="nfa-compare-tt-row">
            <span className="nfa-compare-tt-dot" style={{ background: colorById[r.dataKey] }} />
            <span className="nfa-compare-tt-name">{nameById[r.dataKey]}</span>
            <span className="nfa-compare-tt-val">{r.value.toFixed(1)}</span>
          </div>
        ))}
      <div className="nfa-tooltip-gp">{modeLabel} points</div>
    </div>
  );
}

export default function PlayerCompare({ selected, allPlayers, mode, modeLabel }) {
  const navigate = useNavigate();
  const [compareIds, setCompareIds] = useState(() => defaultComps(selected, allPlayers, mode));
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    setCompareIds(defaultComps(selected, allPlayers, mode));
    setQuery('');
  }, [selected.id]);

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const comparePlayers = useMemo(
    () => compareIds.map((id) => allPlayers.find((p) => p.id === id)).filter(Boolean),
    [compareIds, allPlayers]
  );

  const colorById = useMemo(() => {
    const map = { [selected.id]: POS_COLOR[selected.pos] };
    comparePlayers.forEach((p, i) => {
      map[p.id] = COMPARE_COLORS[i % COMPARE_COLORS.length];
    });
    return map;
  }, [selected, comparePlayers]);

  const nameById = useMemo(() => {
    const map = { [selected.id]: selected.name };
    comparePlayers.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [selected, comparePlayers]);

  const allInChart = [selected, ...comparePlayers];

  const chartData = useMemo(() => {
    const maxYears = Math.max(...allInChart.map((p) => p.seasons.length));
    const rows = [];
    for (let y = 0; y < maxYears; y++) {
      const row = { year: y + 1 };
      allInChart.forEach((p) => {
        const season = p.seasons[y];
        row[p.id] = season ? pts(season, mode) : null;
      });
      rows.push(row);
    }
    return rows;
  }, [allInChart, mode]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const excluded = new Set([selected.id, ...compareIds]);
    return allPlayers
      .filter((p) => p.pos === selected.pos && !excluded.has(p.id) && p.name.toLowerCase().includes(q))
      .sort((a, b) => b.career[mode] - a.career[mode])
      .slice(0, 20);
  }, [query, allPlayers, selected, compareIds, mode]);

  function addCompare(id) {
    if (compareIds.length >= MAX_COMPARES) return;
    setCompareIds((ids) => [...ids, id]);
    setQuery('');
    setFocused(false);
  }

  function removeCompare(id) {
    setCompareIds((ids) => ids.filter((c) => c !== id));
  }

  return (
    <div className="nfa-compare-card">
      <div className="nfa-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={15} />
        Historical Comparison
      </div>

      <p className="nfa-compare-sub">
        Lined up by career year (Year 1 = first season) so players from different eras compare fairly. Showing {selected.pos}s only.
      </p>

      <div className="nfa-compare-chips">
        <span className="nfa-compare-chip nfa-compare-chip-self" style={{ borderColor: colorById[selected.id] }}>
          <span className="nfa-compare-chip-dot" style={{ background: colorById[selected.id] }} />
          {selected.name}
        </span>
        {comparePlayers.map((p) => (
          <span key={p.id} className="nfa-compare-chip" style={{ borderColor: colorById[p.id] }}>
            <span className="nfa-compare-chip-dot" style={{ background: colorById[p.id] }} />
            <button className="nfa-compare-chip-link" onClick={() => navigate(`/players/${p.id}`)}>
              {p.name}
            </button>
            <button className="nfa-compare-chip-remove" onClick={() => removeCompare(p.id)}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>

      {compareIds.length < MAX_COMPARES && (
        <div className="nfa-compare-search-wrap" ref={boxRef}>
          <Search className="nfa-search-icon" size={14} />
          <input
            className="nfa-search-input nfa-compare-search-input"
            placeholder={`Add another ${selected.pos} to compare…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
          />
          {focused && query.trim() && (
            <div className="nfa-dropdown">
              {searchResults.length === 0 && (
                <div className="nfa-dropdown-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                  No {selected.pos}s found
                </div>
              )}
              {searchResults.map((p) => (
                <div key={p.id} className="nfa-dropdown-item" onClick={() => addCompare(p.id)}>
                  <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
                  <span className="nfa-dd-name">{p.name}</span>
                  <span className="nfa-dd-meta">{p.first}–{p.last}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="nfa-turf" style={{ marginTop: 14, borderRadius: 10 }}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 18, right: 16, left: -12, bottom: 4 }}>
            <CartesianGrid stroke="rgba(236,239,234,0.08)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#ECEFEA', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(236,239,234,0.25)' }}
              tickLine={false}
              label={{ value: 'Career Year', position: 'insideBottom', offset: -2, fill: 'rgba(236,239,234,0.45)', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: 'rgba(236,239,234,0.55)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CompareTooltip colorById={colorById} nameById={nameById} modeLabel={modeLabel} />} />
            {allInChart.map((p) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                name={p.name}
                stroke={colorById[p.id]}
                strokeWidth={p.id === selected.id ? 3 : 2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="nfa-table-scroll">
        <table className="nfa-table nfa-compare-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Years</th>
              <th>Seasons</th>
              <th>Career Pts</th>
              <th>PPG</th>
              <th>Best Season</th>
            </tr>
          </thead>
          <tbody>
            {allInChart.map((p) => {
              const best = [...p.seasons].sort((a, b) => pts(b, mode) - pts(a, mode))[0];
              const ppg = p.gp ? p.career[mode] / p.gp : 0;
              return (
                <tr key={p.id} className={p.id === selected.id ? 'nfa-compare-row-self' : ''}>
                  <td>
                    <span className="nfa-compare-chip-dot" style={{ background: colorById[p.id], marginRight: 7 }} />
                    {p.name}
                  </td>
                  <td>{p.first}–{p.last}</td>
                  <td>{p.seasons.length}</td>
                  <td className="nfa-pts-cell">{p.career[mode].toFixed(0)}</td>
                  <td>{ppg.toFixed(1)}</td>
                  <td>{best.s} · {pts(best, mode).toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
