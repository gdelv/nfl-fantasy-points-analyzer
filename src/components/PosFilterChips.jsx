import React from 'react';

export default function PosFilterChips({ value, onChange }) {
  return (
    <div className="nfa-pos-filters">
      {['ALL', 'QB', 'RB', 'WR', 'TE'].map((pos) => (
        <button
          key={pos}
          className={`nfa-pos-chip ${value === pos ? 'active' : ''}`}
          onClick={() => onChange(pos)}
        >
          {pos}
        </button>
      ))}
    </div>
  );
}
