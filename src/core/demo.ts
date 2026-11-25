/* Progressi di esempio, usati solo nell'anteprima per mostrare le schermate piene. */
import { CURR, Q, QI, SUBJ } from "./data";
import { blank, IV, type Entry, type State } from "./leitner";

export function demoState(t: number): State {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const S = blank();
  S.cfg = { exam: t + 17, since: t - 37 };
  CURR.slice(0, 1180).forEach((id, i) => {
    const r = rnd();
    const old = i < 700;
    const lv = old ? (r < 0.08 ? 1 : r < 0.2 ? 2 : r < 0.55 ? 3 : r < 0.88 ? 4 : 5) : r < 0.22 ? 1 : r < 0.6 ? 2 : r < 0.92 ? 3 : 4;
    const ago = Math.floor(rnd() * IV[lv] * 1.07);
    const wrong = lv <= 2 ? 1 + Math.floor(rnd() * 3) : rnd() < 0.3 ? 1 : 0;
    S.p[id] = [lv, t - ago + IV[lv], lv - 1 + Math.floor(rnd() * 2), wrong] as Entry;
  });
  for (let i = 27; i >= 0; i--) {
    if (rnd() < 0.12) continue;
    const n = 30 + Math.floor(rnd() * 150);
    S.log[t - i] = [i === 0 ? 38 : n, Math.round((i === 0 ? 38 : n) * (0.6 + rnd() * 0.25))];
  }
  [41, 52, 49, 58, 63, 61, 68, 72].forEach((sc, k) => {
    const w = 6 + Math.floor(rnd() * 5);
    const c = Math.round(sc / 2 + w / 2);
    const ids: number[] = [];
    SUBJ.forEach((sb, i) => {
      const l = Q.filter((q) => q.s === i);
      const from = Math.floor(rnd() * (l.length - sb.k));
      l.slice(from, from + sb.k).forEach((q) => ids.push(q.id));
    });
    ids.sort(() => rnd() - 0.5);
    const esito = ids.map((_, n) => (n < c ? 0 : n < c + w ? 1 + Math.floor(rnd() * 2) : -1)).sort(() => rnd() - 0.5);
    const per = SUBJ.map(() => [0, 0, 0]);
    ids.forEach((id, n) => per[QI.get(id)!.s][esito[n] === 0 ? 0 : esito[n] === -1 ? 2 : 1]++);
    S.sims.push({ d: t - 21 + k * 3 - (k === 7 ? 1 : 0), c, w, o: 50 - c - w, sc: 2 * c - w, per, q: ids.map((id, n): [number, number] => [id, esito[n]]) });
  });
  return S;
}
