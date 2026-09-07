export function ageAsOf(birthDateStr, refDateStr) {
  if (!birthDateStr) return null;
  const b = new Date(birthDateStr);
  const ref = new Date(refDateStr);
  let age = ref.getFullYear() - b.getFullYear();
  const m = ref.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) age -= 1;
  return age;
}

export function fmtM(v) {
  if (v === null || v === undefined) return '—';
  return `$${v.toFixed(1)}M`;
}

export function pts(row, mode) {
  return row[mode];
}

export function statLine(row, pos) {
  if (pos === 'QB') {
    const bits = [`${row.py.toLocaleString()} PASS YD`, `${row.ptd} TD`, `${row.int} INT`];
    if (row.ry) bits.push(`${row.ry} RUSH YD`);
    return bits.join(' · ');
  }
  if (pos === 'RB') {
    const bits = [`${row.ry.toLocaleString()} RUSH YD`, `${row.rtd} TD`];
    if (row.rec) bits.push(`${row.rec} REC`, `${row.recy.toLocaleString()} REC YD`);
    return bits.join(' · ');
  }
  const bits = [`${row.rec} REC`, `${row.recy.toLocaleString()} YD`, `${row.rectd} TD`];
  if (row.ry) bits.push(`${row.ry} RUSH YD`);
  return bits.join(' · ');
}

export function statColumns(pos) {
  if (pos === 'QB') {
    return [
      { key: 'py', label: 'PASS YD' },
      { key: 'ptd', label: 'PASS TD' },
      { key: 'int', label: 'INT' },
      { key: 'ry', label: 'RUSH YD' },
      { key: 'rtd', label: 'RUSH TD' },
    ];
  }
  if (pos === 'RB') {
    return [
      { key: 'ry', label: 'RUSH YD' },
      { key: 'rtd', label: 'RUSH TD' },
      { key: 'rec', label: 'REC' },
      { key: 'recy', label: 'REC YD' },
      { key: 'rectd', label: 'REC TD' },
    ];
  }
  return [
    { key: 'rec', label: 'REC' },
    { key: 'recy', label: 'REC YD' },
    { key: 'rectd', label: 'REC TD' },
    { key: 'ry', label: 'RUSH YD' },
    { key: 'rtd', label: 'RUSH TD' },
  ];
}
