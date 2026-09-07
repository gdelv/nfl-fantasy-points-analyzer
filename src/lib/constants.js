import STARTER_IDS_ARR from '../data/starters.json';

export const STARTER_IDS = new Set(STARTER_IDS_ARR);

export const POS_ORDER = { QB: 0, RB: 1, WR: 2, TE: 3 };

export const POS_COLOR = {
  QB: '#F5B700',
  RB: '#57B8A2',
  WR: '#E0663D',
  TE: '#6C8FC7',
};

export const POS_LABEL = {
  QB: 'Quarterback',
  RB: 'Running Back',
  WR: 'Wide Receiver',
  TE: 'Tight End',
};

// Palette for comparison-chart lines, assigned in order. Distinct from every POS_COLOR value
// (the primary player's line always uses their POS_COLOR) so no two lines ever share a hue.
export const COMPARE_COLORS = ['#9B6BD1', '#4FC3F7', '#E85D75', '#8BC34A'];

export const MODES = [
  { key: 'std', label: 'Standard' },
  { key: 'h', label: 'Half-PPR' },
  { key: 'ppr', label: 'Full PPR' },
];

// Approximate marker positions for a simple front-view body silhouette, viewBox 0 0 200 440
export const BODY_POINTS = {
  Head: { x: 100, y: 30 },
  Neck: { x: 100, y: 57 },
  Shoulder: { x: 137, y: 82 },
  Chest: { x: 100, y: 106 },
  Ribs: { x: 122, y: 128 },
  Back: { x: 68, y: 118 },
  Abdomen: { x: 100, y: 150 },
  Hip: { x: 119, y: 174 },
  Groin: { x: 100, y: 190 },
  Forearm: { x: 156, y: 178 },
  Elbow: { x: 150, y: 148 },
  'Hand/Wrist': { x: 161, y: 206 },
  Thigh: { x: 115, y: 230 },
  Hamstring: { x: 85, y: 230 },
  Knee: { x: 115, y: 278 },
  Calf: { x: 115, y: 322 },
  Achilles: { x: 85, y: 368 },
  Ankle: { x: 115, y: 362 },
  Foot: { x: 115, y: 388 },
};

export const STATUS_COLOR = {
  Out: '#C0392B',
  Doubtful: '#E0663D',
  Questionable: '#F5B700',
};

// Combine drills: `better` sets sort direction for leaderboards ('asc' = lowest wins, e.g. a fast 40 time).
export const DRILLS = [
  { key: 'forty', label: '40 Yard Dash', better: 'asc', parse: (v) => parseFloat(v), format: (v) => `${v}s` },
  { key: 'vert', label: 'Vertical Jump', better: 'desc', parse: (v) => parseFloat(v), format: (v) => `${v}"` },
  { key: 'broad', label: 'Broad Jump', better: 'desc', parse: (v) => parseFloat(v), format: (v) => `${v}"` },
  { key: 'bench', label: 'Bench Press', better: 'desc', parse: (v) => parseFloat(v), format: (v) => `${v} reps` },
  { key: 'cone', label: '3-Cone Drill', better: 'asc', parse: (v) => parseFloat(v), format: (v) => `${v}s` },
  { key: 'shuttle', label: 'Shuttle', better: 'asc', parse: (v) => parseFloat(v), format: (v) => `${v}s` },
  { key: 'ht', label: 'Height', better: 'desc', parse: (v) => { const [ft, inch] = v.split('-').map(Number); return ft * 12 + inch; }, format: (v) => v },
  { key: 'wt', label: 'Weight', better: 'desc', parse: (v) => parseFloat(v), format: (v) => `${v} lb` },
];
