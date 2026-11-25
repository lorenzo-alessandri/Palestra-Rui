/* Stato globale: progressi nel localStorage del browser (stessa chiave e formato del prototipo). */
import { useSyncExternalStore } from "react";
import { today } from "../core/dates";
import { demoState } from "../core/demo";
import { blank, canonP, type State } from "../core/leitner";

const LS = "palestra-rui-v1";
const LS_TEMA = "palestra-rui-tema";

let S: State = blank();
let demo = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function load(): State {
  try {
    const r = localStorage.getItem(LS);
    if (r) {
      const o = JSON.parse(r);
      if (o && o.p) {
        const s = Object.assign(blank(), o) as State;
        s.p = canonP(s.p);
        s.cfg = s.cfg || {};
        return s;
      }
    }
  } catch {}
  return blank();
}

S = load();
if (__ANTEPRIMA__ && !Object.keys(S.p).length) {
  S = demoState(today());
  demo = true;
}

export const store = {
  get: () => S,
  isDemo: () => demo,
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
  /* Applica una modifica allo stato, salva e avvisa le schermate */
  update(fn: (s: State) => void) {
    fn(S);
    S = { ...S, t: Date.now() };
    if (!demo) {
      try {
        localStorage.setItem(LS, JSON.stringify(S));
      } catch {}
    }
    emit();
  },
  replace(s: State, asDemo = false) {
    demo = asDemo;
    S = s;
    if (!demo) {
      try {
        localStorage.setItem(LS, JSON.stringify(S));
      } catch {}
    }
    emit();
  },
};

export const useS = (): State => useSyncExternalStore(store.subscribe, store.get);

/* ---------- Tema ---------- */
export type Tema = "auto" | "chiaro" | "scuro";
let tema: Tema = "auto";
try {
  const t = localStorage.getItem(LS_TEMA);
  if (t === "chiaro" || t === "scuro") tema = t;
} catch {}
const mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
const applyTema = () => {
  const dark = tema === "scuro" || (tema === "auto" && !!mq?.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};
mq?.addEventListener("change", applyTema);
applyTema();
const temaSubs = new Set<() => void>();
export const temaStore = {
  get: () => tema,
  set(t: Tema) {
    tema = t;
    try {
      if (t === "auto") localStorage.removeItem(LS_TEMA);
      else localStorage.setItem(LS_TEMA, t);
    } catch {}
    applyTema();
    temaSubs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    temaSubs.add(f);
    return () => temaSubs.delete(f);
  },
};
export const useTema = (): Tema => useSyncExternalStore(temaStore.subscribe, temaStore.get);
