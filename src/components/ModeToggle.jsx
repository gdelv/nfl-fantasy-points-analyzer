import React from 'react';
import { MODES } from '../lib/constants';

export default function ModeToggle({ value, onChange }) {
  return (
    <div className="nfa-mode-row">
      {MODES.map((m) => (
        <button
          key={m.key}
          className={`nfa-mode-btn ${value === m.key ? 'active' : ''}`}
          onClick={() => onChange(m.key)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
