import React from 'react';
import { BODY_POINTS } from '../lib/constants';

export default function InjuryBodyMap({ bodyPartSummary, activeBodyPart, onSelect }) {
  return (
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
              onClick={() => onSelect(active ? null : b.bp)}
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
  );
}
