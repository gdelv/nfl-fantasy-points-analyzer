import PLAYER_DATA from './players.json';

export const ALL_PLAYERS = Object.entries(PLAYER_DATA).map(([id, p]) => {
  const teams = [...new Set(p.seasons.map((s) => s.tm).filter(Boolean))];
  const careerStd = p.seasons.reduce((a, s) => a + s.std, 0);
  const careerH = p.seasons.reduce((a, s) => a + s.h, 0);
  const careerPpr = p.seasons.reduce((a, s) => a + s.ppr, 0);
  const gp = p.seasons.reduce((a, s) => a + s.g, 0);
  const first = p.seasons[0].s;
  const last = p.seasons[p.seasons.length - 1].s;
  return {
    id, name: p.name, pos: p.pos, teams, gp, first, last,
    seasons: p.seasons,
    career: { std: careerStd, h: careerH, ppr: careerPpr },
  };
});
