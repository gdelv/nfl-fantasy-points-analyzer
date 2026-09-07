import React from 'react';

export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

      .nfa-root {
        --bg: #0A0E13;
        --panel: #121821;
        --panel-2: #171F2A;
        --turf: #0E2A1F;
        --turf-2: #123424;
        --chalk: #ECEFEA;
        --gold: #F5B700;
        --text: #EDF2F0;
        --text-muted: #7E8C93;
        --border: #22303C;
        --red: #C0392B;
        font-family: 'Inter', sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100%;
        padding: 24px 20px 60px;
        box-sizing: border-box;
      }
      .nfa-root * { box-sizing: border-box; }
      .nfa-wrap { max-width: 980px; margin: 0 auto; }

      .nfa-nav {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 22px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 14px;
      }
      .nfa-nav-brand {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--chalk);
        margin-right: auto;
        text-decoration: none;
      }
      .nfa-nav-brand span { color: var(--gold); }
      .nfa-nav-link {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-muted);
        text-decoration: none;
        padding: 7px 12px;
        border-radius: 8px;
        transition: color 0.15s, background 0.15s;
      }
      .nfa-nav-link:hover { color: var(--text); }
      .nfa-nav-link.active { color: #0A0E13; background: var(--gold); }

      .nfa-eyebrow {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.18em;
        color: var(--gold);
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .nfa-title {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: clamp(28px, 5vw, 42px);
        text-transform: uppercase;
        letter-spacing: 0.01em;
        margin: 0 0 4px;
        line-height: 1.05;
      }
      .nfa-title span { color: var(--gold); }
      .nfa-sub {
        color: var(--text-muted);
        font-size: 14px;
        margin: 0 0 24px;
      }

      .nfa-controls {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 18px;
      }
      .nfa-search {
        position: relative;
        flex: 1 1 280px;
        min-width: 220px;
      }
      .nfa-search-input {
        width: 100%;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 11px 14px 11px 38px;
        color: var(--text);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        outline: none;
        transition: border-color 0.15s;
      }
      .nfa-search-input:focus { border-color: var(--gold); }
      .nfa-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        width: 16px;
        height: 16px;
        pointer-events: none;
      }
      .nfa-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
      }
      .nfa-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        background: var(--panel-2);
        border: 1px solid var(--border);
        border-radius: 10px;
        max-height: 340px;
        overflow-y: auto;
        z-index: 20;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      }
      .nfa-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--border);
      }
      .nfa-dropdown-item:last-child { border-bottom: none; }
      .nfa-dropdown-item:hover { background: rgba(245,183,0,0.08); }
      .nfa-pos-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        color: #0A0E13;
        flex-shrink: 0;
        min-width: 28px;
        text-align: center;
      }
      .nfa-dd-name { font-size: 13.5px; font-weight: 500; flex: 1; }
      .nfa-dd-meta { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

      .nfa-pos-filters { display: flex; gap: 6px; }
      .nfa-pos-chip {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 600;
        padding: 9px 12px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--panel);
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
      }
      .nfa-pos-chip.active { background: var(--gold); color: #0A0E13; border-color: var(--gold); }
      .nfa-pos-chip:hover:not(.active) { border-color: var(--gold); color: var(--text); }

      .nfa-mode-row { display: flex; gap: 6px; margin-bottom: 22px; }
      .nfa-mode-btn {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
      }
      .nfa-mode-btn.active { background: var(--chalk); color: #0A0E13; border-color: var(--chalk); }
      .nfa-mode-row-wrap { flex-wrap: wrap; }

      .nfa-board-row.active { background: rgba(245,183,0,0.1); }
      .nfa-bp-bar-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        min-width: 100px;
      }
      .nfa-bp-bar-track {
        flex: 1;
        height: 8px;
        background: var(--panel-2);
        border-radius: 4px;
        overflow: hidden;
      }
      .nfa-bp-bar-fill {
        height: 100%;
        background: var(--gold);
        border-radius: 4px;
      }

      /* leaderboard (empty state) */
      .nfa-board {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
      }
      .nfa-board-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--border);
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 15px;
        color: var(--gold);
      }
      .nfa-board-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 18px;
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        transition: background 0.12s;
      }
      .nfa-board-row:last-child { border-bottom: none; }
      .nfa-board-row:hover { background: rgba(245,183,0,0.06); }
      .nfa-rank {
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: var(--text-muted);
        width: 20px;
      }
      .nfa-board-name { font-weight: 600; font-size: 14.5px; flex: 1; }
      .nfa-starter-star { color: var(--gold); margin-left: 6px; font-size: 12px; }
      .nfa-board-years { font-size: 11.5px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
      .nfa-board-pts {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        color: var(--gold);
        font-size: 14px;
        min-width: 70px;
        text-align: right;
      }
      .nfa-board-arrow { color: var(--text-muted); width: 16px; height: 16px; flex-shrink: 0; }
      .nfa-expiring-board { margin-top: 18px; }
      .nfa-expiring-sub {
        font-size: 12px;
        color: var(--text-muted);
        padding: 10px 18px;
        border-bottom: 1px solid var(--border);
        line-height: 1.5;
      }

      .nfa-quick-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin: 22px 0;
      }
      .nfa-quick-link {
        display: block;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 16px;
        text-decoration: none;
        transition: border-color 0.15s;
      }
      .nfa-quick-link:hover { border-color: var(--gold); }
      .nfa-quick-link-title {
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        font-size: 15px;
        color: var(--chalk);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .nfa-quick-link-sub { font-size: 12.5px; color: var(--text-muted); }
      .nfa-section-more {
        display: inline-block;
        margin-top: 14px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 600;
        color: var(--gold);
        text-decoration: none;
      }
      .nfa-section-more:hover { text-decoration: underline; }

      /* selected player */
      .nfa-player-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .nfa-player-name {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: clamp(24px, 4vw, 34px);
        text-transform: uppercase;
        margin: 0 0 4px;
      }
      .nfa-player-meta {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .nfa-player-pos-badge {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 12px;
        padding: 3px 9px;
        border-radius: 5px;
        color: #0A0E13;
      }
      .nfa-back-btn {
        background: var(--panel);
        border: 1px solid var(--border);
        color: var(--text-muted);
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 12.5px;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }
      .nfa-back-btn:hover { color: var(--text); border-color: var(--gold); }

      .nfa-combine-strip {
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--panel);
        padding: 12px 16px;
        margin-bottom: 18px;
      }
      .nfa-combine-draft {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
        color: var(--text-muted);
        margin-bottom: 10px;
      }
      .nfa-combine-metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
      }
      .nfa-combine-cell {
        display: flex;
        flex-direction: column;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 600;
        color: var(--chalk);
      }
      .nfa-combine-cell span {
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 2px;
      }
      .nfa-combine-cell em {
        font-style: normal;
        font-size: 10px;
        font-weight: 600;
        color: var(--gold);
        margin-top: 2px;
      }
      .nfa-combine-hint {
        font-size: 10px;
        color: var(--text-muted);
        margin-top: 10px;
      }

      .nfa-scoreboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .nfa-sb-cell {
        background: #060907;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px 14px;
      }
      .nfa-sb-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 4px;
      }
      .nfa-sb-value {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 22px;
        color: var(--gold);
        letter-spacing: 0.02em;
      }
      .nfa-sb-value small { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-left: 3px; }

      .nfa-chart-card {
        border-radius: 14px;
        border: 1px solid var(--border);
        overflow: hidden;
        margin-bottom: 22px;
      }
      .nfa-chart-header {
        background: var(--panel);
        padding: 12px 18px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border);
      }
      .nfa-turf {
        background:
          repeating-linear-gradient(90deg, var(--turf-2) 0px, var(--turf-2) 40px, var(--turf) 40px, var(--turf) 80px);
        padding: 18px 10px 6px;
        position: relative;
      }
      .nfa-turf::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 6px;
        background: repeating-linear-gradient(90deg, var(--chalk) 0px, var(--chalk) 2px, transparent 2px, transparent 16px);
        opacity: 0.35;
      }

      .nfa-tooltip {
        background: #060907;
        border: 1px solid var(--gold);
        border-radius: 8px;
        padding: 10px 12px;
        font-family: 'JetBrains Mono', monospace;
        min-width: 170px;
      }
      .nfa-tooltip-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
      .nfa-tooltip-season { font-weight: 700; font-size: 13px; color: var(--chalk); }
      .nfa-tooltip-team { font-size: 11px; color: var(--text-muted); }
      .nfa-tooltip-pts { font-size: 18px; font-weight: 700; color: var(--gold); margin-bottom: 4px; }
      .nfa-tooltip-pts small { font-size: 9.5px; color: var(--text-muted); font-weight: 500; }
      .nfa-tooltip-stats { font-size: 10.5px; color: var(--text); line-height: 1.5; margin-bottom: 3px; }
      .nfa-tooltip-gp { font-size: 10px; color: var(--text-muted); }

      .nfa-table-wrap {
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
      }
      .nfa-table-scroll { overflow-x: auto; }
      table.nfa-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; min-width: 640px; }
      table.nfa-table thead th {
        text-align: right;
        padding: 10px 12px;
        background: var(--panel);
        color: var(--text-muted);
        font-weight: 600;
        font-size: 10.5px;
        letter-spacing: 0.06em;
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
      }
      table.nfa-table thead th:first-child, table.nfa-table thead th:nth-child(2) { text-align: left; }
      table.nfa-table tbody td {
        text-align: right;
        padding: 9px 12px;
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
      }
      table.nfa-table tbody td:first-child, table.nfa-table tbody td:nth-child(2) { text-align: left; }
      table.nfa-table tbody tr:last-child td { border-bottom: none; }
      table.nfa-table tbody tr:hover { background: rgba(245,183,0,0.05); }
      table.nfa-table .nfa-pts-cell { color: var(--gold); font-weight: 700; }
      .nfa-table-title {
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 14px;
        padding: 14px 18px;
        background: var(--panel);
        border-bottom: 1px solid var(--border);
        color: var(--gold);
      }

      .nfa-injury-card {
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        margin-top: 22px;
      }
      .nfa-injury-empty {
        padding: 18px;
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.6;
      }
      .nfa-injury-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
        padding: 16px 18px 0;
      }
      .nfa-injury-body {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 18px;
        padding: 18px;
      }
      .nfa-body-diagram {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .nfa-body-svg {
        width: 100%;
        max-width: 210px;
        height: auto;
      }
      .nfa-body-shape {
        fill: rgba(236,239,234,0.07);
        stroke: rgba(236,239,234,0.22);
        stroke-width: 1.5;
      }
      .nfa-body-limb {
        stroke: rgba(236,239,234,0.22);
        stroke-width: 13;
        stroke-linecap: round;
        fill: rgba(236,239,234,0.07);
      }
      .nfa-body-limb-thick {
        stroke: rgba(236,239,234,0.22);
        stroke-width: 20;
        stroke-linecap: round;
        fill: rgba(236,239,234,0.07);
      }
      .nfa-marker-group { cursor: pointer; }
      .nfa-marker-dot { transition: r 0.15s; }
      .nfa-body-hint {
        font-size: 10px;
        color: var(--text-muted);
        text-align: center;
        margin: 10px 0 0;
        line-height: 1.5;
      }
      .nfa-injury-list-wrap { min-width: 0; }
      .nfa-bp-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }
      .nfa-injury-log {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 420px;
        overflow-y: auto;
      }
      .nfa-injury-row {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 9px 12px;
      }
      .nfa-injury-row-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .nfa-injury-bp {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 13.5px;
      }
      .nfa-injury-status {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 7px;
        border: 1px solid;
        border-radius: 999px;
      }
      .nfa-injury-row-meta {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--text-muted);
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      @media (max-width: 640px) {
        .nfa-injury-body { grid-template-columns: 1fr; }
      }

      .nfa-contract-card {
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        margin-top: 22px;
      }
      .nfa-contract-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 16px 18px 12px;
      }
      .nfa-contract-team {
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        font-size: 17px;
        color: var(--chalk);
      }
      .nfa-contract-span {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .nfa-contract-remaining {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        color: var(--gold);
        background: rgba(245,183,0,0.1);
        border: 1px solid rgba(245,183,0,0.35);
        border-radius: 999px;
        padding: 5px 12px;
        white-space: nowrap;
      }
      .nfa-contract-2026 {
        margin-top: 4px;
        padding-bottom: 18px;
      }
      .nfa-contract-2026-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: 10px 18px 8px;
      }

      .nfa-footnote {
        margin-top: 18px;
        font-size: 11.5px;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .nfa-page-head { margin-bottom: 22px; }
      .nfa-page-title {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: clamp(24px, 4vw, 32px);
        text-transform: uppercase;
        margin: 0 0 4px;
      }
      .nfa-page-sub { color: var(--text-muted); font-size: 13.5px; margin: 0; }

      .nfa-not-found { padding: 40px 0; text-align: center; color: var(--text-muted); }

      @media (max-width: 560px) {
        .nfa-scoreboard { grid-template-columns: repeat(2, 1fr); }
      }
    `}</style>
  );
}
