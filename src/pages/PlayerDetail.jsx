import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Activity, DollarSign } from 'lucide-react';
import { ALL_PLAYERS } from '../data/allPlayers';
import INJURY_DATA from '../data/injuries.json';
import CONTRACT_DATA from '../data/contracts.json';
import COMBINE_DATA from '../data/combine.json';
import RANK_DATA from '../data/ranks.json';
import { POS_COLOR, MODES, STATUS_COLOR } from '../lib/constants';
import { pts, statColumns, fmtM } from '../lib/format';
import { useFilters } from '../context/FiltersContext';
import ModeToggle from '../components/ModeToggle';
import ChartTooltip from '../components/ChartTooltip';
import InjuryBodyMap from '../components/InjuryBodyMap';

export default function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode, setMode } = useFilters();
  const [activeBodyPart, setActiveBodyPart] = useState(null);

  const selected = ALL_PLAYERS.find((p) => p.id === id);

  const modeLabel = MODES.find((m) => m.key === mode).label;

  const bestSeason = useMemo(
    () => (selected ? [...selected.seasons].sort((a, b) => pts(b, mode) - pts(a, mode))[0] : null),
    [selected, mode]
  );
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

  if (!selected) return <Navigate to="/leaders" replace />;

  return (
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
        <button className="nfa-back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <ModeToggle value={mode} onChange={setMode} />

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
              <Tooltip content={<ChartTooltip pos={selected.pos} modeLabel={modeLabel} />} cursor={{ fill: 'rgba(236,239,234,0.06)' }} />
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
              <InjuryBodyMap
                bodyPartSummary={bodyPartSummary}
                activeBodyPart={activeBodyPart}
                onSelect={setActiveBodyPart}
              />

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
  );
}
