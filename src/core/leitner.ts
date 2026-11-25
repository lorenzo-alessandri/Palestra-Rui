/* Stato dei progressi e ripetizione dilazionata (Leitner). Logica portata 1:1 dal prototipo. */
import { CAN, CARDS, CURR, QI, SUBJ, UN } from "./data";

/* [livello, giorno_di_scadenza, n_giuste, n_sbagliate] */
export type Entry = [number, number, number, number];
export interface SimRec {
  d: number;
  c: number;
  w: number;
  o: number;
  sc: number;
  per: number[][];
  q?: [number, number][];
}
export interface State {
  v: 1;
  t: number;
  p: Record<string, Entry>;
  sims: SimRec[];
  log: Record<string, [number, number]>;
  intro: Record<string, number>;
  cfg: { exam?: number; since?: number };
}

export const IV = [0, 1, 3, 7, 14, 30];
export const blank = (): State => ({ v: 1, t: 0, p: {}, sims: [], log: {}, intro: {}, cfg: {} });

const lastDay = (e: Entry) => e[1] - IV[e[0]];

/* Sposta i progressi salvati su una copia di un doppione sull'id canonico */
export function canonP(p: Record<string, Entry> | undefined): Record<string, Entry> {
  const out: Record<string, Entry> = {};
  for (const [k, e] of Object.entries(p || {})) {
    const id = +k;
    if (!QI.has(id) || !Array.isArray(e)) continue;
    const c = CAN(id);
    const x = out[c];
    if (!x) {
      out[c] = e.slice(0, 4) as Entry;
      continue;
    }
    const pick = lastDay(e) > lastDay(x) ? e : x;
    out[c] = [pick[0], pick[1], x[2] + e[2], x[3] + e[3]];
  }
  return out;
}

/* Unione usata dall'importazione: per ogni carta vince la storia con più risposte */
export function mergeInto(S: State, o: Partial<State>): boolean {
  const tot = (e?: Entry) => (e ? e[2] + e[3] : -1);
  let ch = false;
  for (const [id, e] of Object.entries(canonP(o.p))) {
    const c = S.p[id];
    if (!c || tot(e) > tot(c) || (tot(e) === tot(c) && e[1] > c[1])) {
      if (!c || c.join() !== e.join()) ch = true;
      S.p[id] = e.slice(0, 4) as Entry;
    }
  }
  for (const [d, l] of Object.entries(o.log || {})) {
    const c = S.log[d];
    if (!c || l[0] > c[0]) {
      S.log[d] = l;
      ch = true;
    }
  }
  for (const [d, n] of Object.entries(o.intro || {})) {
    if (n > (S.intro[d] || 0)) {
      S.intro[d] = n;
      ch = true;
    }
  }
  const key = (s: SimRec) => [s.d, s.c, s.w, s.o].join("|");
  const have = new Set(S.sims.map(key));
  (o.sims || []).forEach((s) => {
    if (!have.has(key(s))) {
      S.sims.push(s);
      have.add(key(s));
      ch = true;
    }
  });
  S.sims.sort((a, b) => a.d - b.d);
  if (o.cfg && o.cfg.exam != null && S.cfg.exam == null) {
    S.cfg = { ...o.cfg };
    ch = true;
  }
  return ch;
}

export const seenCount = (S: State) => Object.keys(S.p).length;
export const unseenCount = (S: State) => Math.max(0, UN - seenCount(S));

/* Ripassi in scadenza: prima i più vecchi, a parità di data il livello più basso */
export function dueIds(S: State, t: number): number[] {
  return Object.entries(S.p)
    .filter(([, e]) => e[1] <= t)
    .sort((a, b) => a[1][1] - b[1][1] || a[1][0] - b[1][0])
    .map(([id]) => +id);
}

export function newIds(S: State, n: number): number[] {
  const o: number[] = [];
  for (const id of CURR) {
    if (o.length >= n) break;
    if (!S.p[id]) o.push(id);
  }
  return o;
}

export const boxOf = (S: State, id: number): number => {
  const e = S.p[CAN(id)];
  return e ? e[0] : -1;
};

export function record(S: State, id: number, correct: boolean, t: number): void {
  id = CAN(id);
  let e = S.p[id];
  if (!e) {
    S.intro[t] = (S.intro[t] || 0) + 1;
    e = [correct ? 2 : 1, 0, 0, 0];
  } else {
    e = e.slice() as Entry;
    e[0] = correct ? Math.min(e[0] + 1, 5) : 1;
  }
  e[1] = t + IV[e[0]];
  if (correct) e[2]++;
  else e[3]++;
  S.p[id] = e;
  const l = S.log[t] || [0, 0];
  S.log[t] = [l[0] + 1, l[1] + (correct ? 1 : 0)];
}

export interface SubjStat {
  tot: number;
  m: number;
  l: number;
}
export function subjStats(S: State): SubjStat[] {
  const r = SUBJ.map(() => ({ tot: 0, m: 0, l: 0 }));
  CARDS.forEach((q) => {
    r[q.s].tot++;
    const b = boxOf(S, q.id);
    if (b >= 3) r[q.s].m++;
    else if (b >= 1) r[q.s].l++;
  });
  return r;
}

export const didSimToday = (S: State, t: number) => S.sims.some((s) => s.d === t);
export const hasErrors = (S: State) => Object.values(S.p).some((e) => e[3] > 0);
