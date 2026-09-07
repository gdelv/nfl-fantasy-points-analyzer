import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { POS_COLOR } from '../lib/constants';

export default function PlayerSearch({ players, posFilter, mode }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
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

  function pick(id) {
    setQuery('');
    setFocused(false);
    navigate(`/players/${id}`);
  }

  return (
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
  );
}
