import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ChevronRight } from 'lucide-react';
import { ALL_PLAYERS } from '../data/allPlayers';
import CONTRACT_DATA from '../data/contracts.json';
import BIRTHDATE_DATA from '../data/birthdates.json';
import { POS_COLOR, POS_LABEL, POS_ORDER, STARTER_IDS } from '../lib/constants';
import { ageAsOf, fmtM } from '../lib/format';
import { useFilters } from '../context/FiltersContext';
import PlayerSearch from '../components/PlayerSearch';
import PosFilterChips from '../components/PosFilterChips';

export default function Contracts() {
  const { posFilter, setPosFilter, mode } = useFilters();
  const navigate = useNavigate();

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
      });
  }, [posFilter]);

  return (
    <>
      <div className="nfa-page-head">
        <h1 className="nfa-page-title">Contract Year Watch</h1>
        <p className="nfa-page-sub">Every player entering the final year of their deal, or on a one-year contract, for the 2026 season.</p>
      </div>

      <div className="nfa-controls">
        <PlayerSearch players={ALL_PLAYERS} posFilter={posFilter} mode={mode} />
        <PosFilterChips value={posFilter} onChange={setPosFilter} />
      </div>

      <div className="nfa-board">
        <div className="nfa-board-head">
          <DollarSign size={16} />
          Contract Year Watch — 2026 {posFilter !== 'ALL' ? `· ${POS_LABEL[posFilter]}` : ''}
        </div>
        <p className="nfa-expiring-sub">Grouped by position, youngest first. <span className="nfa-starter-star">★</span> marks a current depth-chart starter.</p>
        {expiringContracts.length === 0 && (
          <p className="nfa-injury-empty">No expiring contracts on file for this position.</p>
        )}
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
    </>
  );
}
