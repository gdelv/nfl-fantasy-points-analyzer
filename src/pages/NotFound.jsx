import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="nfa-not-found">
      <p>Page not found.</p>
      <Link to="/" className="nfa-section-more">← Back home</Link>
    </div>
  );
}
