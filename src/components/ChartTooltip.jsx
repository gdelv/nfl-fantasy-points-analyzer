import React from 'react';
import { pts, statLine } from '../lib/format';

export default function ChartTooltip({ active, payload, pos, modeLabel }) {
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
