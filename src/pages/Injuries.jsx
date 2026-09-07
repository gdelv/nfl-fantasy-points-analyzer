import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight } from 'lucide-react';
import { ALL_PLAYERS } from '../data/allPlayers';
import INJURY_DATA from '../data/injuries.json';
import { POS_COLOR, POS_LABEL } from '../lib/constants';
import { useFilters } from '../context/FiltersContext';
import PlayerSearch from '../components/PlayerSearch';
import PosFilterChips from '../components/PosFilterChips';
import InjuryBodyMap from '../components/InjuryBodyMap';

const TOP_BODY_PARTS = 12;
const TOP_PLAYERS = 15;

export default function Injuries() {
  const { posFilter, setPosFilter, mode } = useFilters();
  const navigate = useNavigate();
  const [activeBodyPart, setActiveBodyPart] = useState(null);

  const scopedPlayers = useMemo(
    () => (posFilter === 'ALL' ? ALL_PLAYERS : ALL_PLAYERS.filter((p) => p.pos === posFilter)),
    [posFilter]
  );

  const playerInjuryStats = useMemo(() => {
    return scopedPlayers
      .map((p) => {
        const spells = INJURY_DATA[p.id] || [];
        return { ...p, events: spells.length, missed: spells.reduce((a, s) => a + s.missed, 0) };
      })
      .filter((p) => p.events > 0);
  }, [scopedPlayers]);

  const bodyPartSummary = useMemo(() => {
    const map = {};
    playerInjuryStats.forEach((p) => {
      (INJURY_DATA[p.id] || []).forEach((s) => {
        if (!map[s.bp]) map[s.bp] = { bp: s.bp, count: 0, missed: 0, players: new Set() };
        map[s.bp].count += 1;
        map[s.bp].missed += s.missed;
        map[s.bp].players.add(p.id);
      });
    });
    return Object.values(map)
      .map((b) => ({ ...b, players: b.players.size }))
      .sort((a, b) => b.missed - a.missed || b.count - a.count);
  }, [playerInjuryStats]);

  const topBodyParts = bodyPartSummary.slice(0, TOP_BODY_PARTS);
  const maxMissed = topBodyParts[0] ? topBodyParts[0].missed || 1 : 1;

  const totalEvents = playerInjuryStats.reduce((a, p) => a + p.events, 0);
  const totalMissed = playerInjuryStats.reduce((a, p) => a + p.missed, 0);

  const topByMissed = useMemo(() => {
    let list = playerInjuryStats;
    if (activeBodyPart) {
      list = list.filter((p) => (INJURY_DATA[p.id] || []).some((s) => s.bp === activeBodyPart));
    }
    return [...list].sort((a, b) => b.missed - a.missed || b.events - a.events).slice(0, TOP_PLAYERS);
  }, [playerInjuryStats, activeBodyPart]);

  return (
    <>
      <div className="nfa-page-head">
        <h1 className="nfa-page-title">Injury Report</h1>
        <p className="nfa-page-sub">League-wide view of tracked weekly injury designations, 2009–2025.</p>
      </div>

      <div className="nfa-controls">
        <PlayerSearch players={ALL_PLAYERS} posFilter={posFilter} mode={mode} />
        <PosFilterChips value={posFilter} onChange={setPosFilter} />
      </div>

      <div className="nfa-scoreboard">
        <div className="nfa-sb-cell">
          <div className="nfa-sb-label">Players Tracked</div>
          <div className="nfa-sb-value">{playerInjuryStats.length}</div>
        </div>
        <div className="nfa-sb-cell">
          <div className="nfa-sb-label">Logged Events</div>
          <div className="nfa-sb-value">{totalEvents}</div>
        </div>
        <div className="nfa-sb-cell">
          <div className="nfa-sb-label">Games Missed</div>
          <div className="nfa-sb-value">{totalMissed}<small>per report</small></div>
        </div>
        <div className="nfa-sb-cell">
          <div className="nfa-sb-label">Body Parts</div>
          <div className="nfa-sb-value">{bodyPartSummary.length}</div>
        </div>
      </div>

      <div className="nfa-injury-card" style={{ marginTop: 0 }}>
        <div className="nfa-table-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={15} />
          Most reported body parts {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
        </div>

        {topBodyParts.length === 0 && (
          <p className="nfa-injury-empty">No tracked injury events for this position.</p>
        )}

        {topBodyParts.length > 0 && (
          <div className="nfa-injury-body">
            <InjuryBodyMap
              bodyPartSummary={topBodyParts}
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
              </div>
              <div className="nfa-injury-log">
                {topBodyParts.map((b) => (
                  <div
                    key={b.bp}
                    className={`nfa-board-row ${activeBodyPart === b.bp ? 'active' : ''}`}
                    style={{ padding: '9px 4px', borderBottom: 'none' }}
                    onClick={() => setActiveBodyPart(activeBodyPart === b.bp ? null : b.bp)}
                  >
                    <span className="nfa-board-name" style={{ flex: '0 0 110px' }}>{b.bp}</span>
                    <div className="nfa-bp-bar-wrap">
                      <div className="nfa-bp-bar-track">
                        <div className="nfa-bp-bar-fill" style={{ width: `${Math.max(4, (b.missed / maxMissed) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="nfa-board-years">{b.players} player{b.players === 1 ? '' : 's'}</span>
                    <span className="nfa-board-pts">{b.missed} gm</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="nfa-board" style={{ marginTop: 18 }}>
        <div className="nfa-board-head">
          <Activity size={16} />
          Most Games Missed{activeBodyPart ? ` · ${activeBodyPart}` : ''} {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
        </div>
        {topByMissed.length === 0 && (
          <p className="nfa-injury-empty">No tracked injury events for this filter.</p>
        )}
        {topByMissed.map((p, idx) => (
          <div key={p.id} className="nfa-board-row" onClick={() => navigate(`/players/${p.id}`)}>
            <span className="nfa-rank">{idx + 1}</span>
            <span className="nfa-pos-badge" style={{ background: POS_COLOR[p.pos] }}>{p.pos}</span>
            <span className="nfa-board-name">{p.name}</span>
            <span className="nfa-board-years">{p.events} event{p.events === 1 ? '' : 's'} logged</span>
            <span className="nfa-board-pts">{p.missed} gm</span>
            <ChevronRight className="nfa-board-arrow" />
          </div>
        ))}
      </div>
    </>
  );
}
