/* Sessione di studio continua. Logica portata 1:1 dal prototipo:
   - Ripassi: solo carte in scadenza; Nuove: mai viste nell'ordine del curriculum, con le gemelle subito dopo;
     Miste: alterna in proporzione a quante ne restano.
   - Una carta sbagliata torna dopo 5 carte, al massimo 2 volte; le ripetizioni non cambiano il livello. */
import { useSyncExternalStore } from "react";
import { CAN, MEM, QI, TW } from "../core/data";
import { today } from "../core/dates";
import { boxOf, dueIds, newIds, record, unseenCount } from "../core/leitner";
import { store } from "./store";

export type Mode = "rev" | "new" | "mix";
export const MODES: Record<Mode, string> = { rev: "Ripassi", new: "Nuove", mix: "Miste" };

export interface Card {
  id: number;
  m?: number;
  twin?: boolean;
  retry?: boolean;
  at?: number;
  tries?: number;
}
export interface Sess {
  kind: "daily" | "drill";
  label: string;
  mode?: Mode;
  list: number[] | null;
  retries: Card[];
  twinQ: number[];
  n: number;
  right: number;
  wrong: number;
  cur: Card | null;
  answered: string | null;
  opts: string[] | null;
  /* livello della carta prima della risposta: -1 = nuova */
  box: number;
}
export interface Fine {
  label: string;
  n: number;
  right: number;
  rest: number[];
}

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const shuffle = <T,>(a: T[]): T[] => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let sess: Sess | null = null;
let fine: Fine | null = null;
let snap: { sess: Sess | null; fine: Fine | null; v: number } = { sess, fine, v: 0 };
const subs = new Set<() => void>();
const emit = () => {
  snap = { sess, fine, v: snap.v + 1 };
  subs.forEach((f) => f());
};

function newSess(kind: Sess["kind"], label: string, ids?: number[]): Sess {
  const l = ids ? [...new Set(ids.map(CAN))] : null;
  return { kind, label, list: l, retries: [], twinQ: [], n: 0, right: 0, wrong: 0, cur: null, answered: null, opts: null, box: -1 };
}

function nextCard(s: Sess): Card | null {
  const S = store.get();
  const t = today();
  s.retries.sort((a, b) => a.at! - b.at!);
  if (s.retries.length && s.retries[0].at! <= s.n) return s.retries.shift()!;
  const busy = new Set(s.retries.map((r) => r.id));
  if (s.kind === "daily") {
    const takeRev = (): Card | null => {
      const due = dueIds(S, t).filter((id) => !busy.has(id));
      return due.length ? { id: due[0] } : null;
    };
    const takeNew = (): Card | null => {
      while (s.twinQ.length) {
        const c = s.twinQ.shift()!;
        if (!S.p[c] && !busy.has(c)) return { id: c, twin: true };
      }
      const nw = newIds(S, 1);
      return nw.length ? { id: nw[0] } : null;
    };
    let c: Card | null = null;
    if (s.mode === "rev") c = takeRev();
    else if (s.mode === "new") c = takeNew();
    else {
      const d = dueIds(S, t).length;
      const n = unseenCount(S) + s.twinQ.length;
      const preferNew = s.twinQ.length > 0 || Math.random() < n / (d + n || 1);
      c = preferNew ? takeNew() || takeRev() : takeRev() || takeNew();
    }
    if (c) return c;
  } else {
    while (s.list!.length) {
      const c = s.list!.shift()!;
      if (!busy.has(c)) return { id: c };
    }
  }
  if (s.retries.length) return s.retries.shift()!;
  return null;
}

/* Prepara la carta successiva, oppure chiude la sessione se non ce ne sono più */
function advance() {
  const s = sess;
  if (!s) return;
  const S = store.get();
  const c = nextCard(s);
  if (!c) return end();
  c.m = c.m || pick(MEM.get(CAN(c.id)) || [c.id]);
  const q0 = QI.get(c.m)!;
  s.cur = c;
  s.answered = null;
  s.box = boxOf(S, c.id);
  s.opts = shuffle([q0.ok, ...q0.w]);
  if (s.kind === "daily" && !c.retry && s.box < 0) {
    const tw = TW(c.id).filter((x) => !S.p[x] && x !== c.id && !s.twinQ.includes(x));
    s.twinQ.unshift(...tw);
  }
  emit();
}

function end() {
  const s = sess;
  if (!s) return;
  fine = {
    label: s.label,
    n: s.right + s.wrong,
    right: s.right,
    rest: s.kind === "drill" ? [...new Set([...s.list!, ...s.retries.map((r) => r.id)])] : [],
  };
  sess = null;
  emit();
}

export const session = {
  get: () => snap,
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
  startDaily(mode: Mode): boolean {
    const S = store.get();
    const due = dueIds(S, today()).length;
    const nw = unseenCount(S);
    if ((mode === "rev" && !due) || (mode === "new" && !nw) || (!due && !nw)) return false;
    sess = newSess("daily", MODES[mode]);
    sess.mode = mode;
    fine = null;
    advance();
    return true;
  },
  startDrill(ids: number[], label: string): boolean {
    ids = [...new Set(ids.map(CAN))];
    if (!ids.length) return false;
    sess = newSess("drill", label, ids);
    fine = null;
    advance();
    return true;
  },
  /* o = testo dell'opzione scelta; "" = «Non lo so» */
  answer(o: string) {
    const s = sess;
    if (!s || !s.cur || s.answered !== null) return;
    const it = s.cur;
    const q = QI.get(it.m!)!;
    const ok = o === q.ok;
    s.answered = o;
    s.n++;
    if (!it.retry) {
      store.update((S) => record(S, q.id, ok, today()));
      if (ok) s.right++;
      else s.wrong++;
    }
    const tries = (it.tries || 0) + 1;
    if (!ok && tries <= 2) s.retries.push({ id: it.id, m: it.m, retry: true, at: s.n + 5, tries });
    emit();
  },
  next() {
    if (!sess || sess.answered === null) return;
    sess.cur = null;
    advance();
  },
  end,
  clearFine() {
    fine = null;
    emit();
  },
};

export const useSession = () => useSyncExternalStore(session.subscribe, session.get);
