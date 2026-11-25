/* Simulazione d'esame: 50 quesiti in 75 minuti. Logica portata 1:1 dal prototipo.
   La simulazione in corso sopravvive alla ricarica della pagina (chiave palestra-rui-sim). */
import { useSyncExternalStore } from "react";
import { CAN, Q, QI, SUBJ } from "../core/data";
import { today } from "../core/dates";
import { record } from "../core/leitner";
import { shuffle } from "./session";
import { store } from "./store";

const LSSIM = "palestra-rui-sim";
export const N_SIM = 50;
export const SOGLIA = 60;

export interface SimRes {
  c: number;
  w: number;
  o: number;
  sc: number;
  per: number[][];
  mins?: number;
}
export interface Sim {
  ids: number[];
  opts: Record<string, string[]>;
  ans: Record<string, string>;
  start: number;
  dur: number;
  cur: number;
  done: boolean;
  res?: SimRes;
}

let sim: Sim | null = null;
try {
  const r = localStorage.getItem(LSSIM);
  if (r) {
    const o = JSON.parse(r);
    if (o && o.ids && !o.done) sim = o;
  }
} catch {}
let snap: { sim: Sim | null; v: number } = { sim, v: 0 };
const subs = new Set<() => void>();
const save = () => {
  try {
    if (sim && !sim.done) localStorage.setItem(LSSIM, JSON.stringify(sim));
    else localStorage.removeItem(LSSIM);
  } catch {}
};
const emit = () => {
  save();
  snap = { sim, v: snap.v + 1 };
  subs.forEach((f) => f());
};

export const simLeft = (s: Sim) => s.start + s.dur - Date.now();
export const fmtT = (ms: number) => {
  ms = Math.max(0, ms);
  const m = Math.floor(ms / 60e3);
  const s = Math.floor((ms % 60e3) / 1e3);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const simStore = {
  get: () => snap,
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
  /* 50 quesiti a caso da tutte le 1.758, ripartiti per materia; mai due copie dello stesso doppione */
  start() {
    const ids: number[] = [];
    const seenC = new Set<number>();
    SUBJ.forEach((s, i) => {
      let k = 0;
      for (const q of shuffle(Q.filter((q) => q.s === i))) {
        if (k >= s.k) break;
        if (seenC.has(CAN(q.id))) continue;
        seenC.add(CAN(q.id));
        ids.push(q.id);
        k++;
      }
    });
    const o = shuffle(ids);
    sim = {
      ids: o,
      opts: Object.fromEntries(
        o.map((id) => {
          const q = QI.get(id)!;
          return [id, shuffle([q.ok, ...q.w])];
        }),
      ),
      ans: {},
      start: Date.now(),
      dur: 75 * 60e3,
      cur: 0,
      done: false,
    };
    emit();
  },
  /* Scegliere di nuovo la stessa opzione la toglie */
  toggle(k: number) {
    if (!sim || sim.done) return;
    const id = sim.ids[sim.cur];
    const o = sim.opts[id][k];
    if (o === undefined) return;
    if (sim.ans[id] === o) delete sim.ans[id];
    else sim.ans[id] = o;
    emit();
  },
  clear() {
    if (!sim || sim.done) return;
    delete sim.ans[sim.ids[sim.cur]];
    emit();
  },
  goto(i: number) {
    if (!sim || sim.done || i < 0 || i >= sim.ids.length) return;
    sim.cur = i;
    emit();
  },
  submit() {
    if (!sim || sim.done) return;
    const s = sim;
    let c = 0;
    let w = 0;
    let o = 0;
    const per = SUBJ.map(() => [0, 0, 0]);
    const t = today();
    store.update((S) => {
      s.ids.forEach((id) => {
        const q = QI.get(id)!;
        const a = s.ans[id];
        if (a === undefined) {
          o++;
          per[q.s][2]++;
          record(S, id, false, t);
        } else if (a === q.ok) {
          c++;
          per[q.s][0]++;
          record(S, id, true, t);
        } else {
          w++;
          per[q.s][1]++;
          record(S, id, false, t);
        }
      });
      const pts = c - w / 2;
      const sc = Math.round(Math.max(0, pts) * 2 * 10) / 10;
      const det = s.ids.map((id): [number, number] => {
        const q = QI.get(id)!;
        const a = s.ans[id];
        return [id, a === undefined ? -1 : a === q.ok ? 0 : q.w.indexOf(a) + 1];
      });
      s.done = true;
      s.res = { c, w, o, sc, per, mins: Math.round(Math.min(s.dur, Date.now() - s.start) / 60e3) };
      S.sims.push({ d: t, c, w, o, sc, per, q: det });
    });
    emit();
  },
  close() {
    sim = null;
    emit();
  },
};

export const useSim = () => useSyncExternalStore(simStore.subscribe, simStore.get);
