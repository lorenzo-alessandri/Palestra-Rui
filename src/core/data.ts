/* Database IVASS (modulo assicurativo) e legami tra domande.
   Formato dei dati: [id, materia, domanda, risposta_esatta, sbagliata_1, sbagliata_2]. */
import rawQ from "../data/questions.json?raw";
import rawL from "../data/links.json?raw";

export interface Question {
  id: number;
  s: number;
  q: string;
  ok: string;
  w: [string, string];
}

export const SUBJ = [
  { n: "Diritto delle assicurazioni e regolamenti IVASS", s: "Diritto assicurazioni", k: 15 },
  { n: "Attività agenziale e di mediazione", s: "Distribuzione", k: 15 },
  { n: "Tecnica assicurativa vita e danni", s: "Tecnica", k: 10 },
  { n: "Diritto privato", s: "Diritto privato", k: 4 },
  { n: "Tutela del consumatore", s: "Consumatore", k: 2 },
  { n: "Diritto tributario", s: "Tributario", k: 2 },
  { n: "Previdenza complementare", s: "Previdenza", k: 2 },
] as const;

type Raw = [number, number, string, string, string, string];
export const Q: Question[] = (JSON.parse(rawQ) as Raw[]).map((a) => ({
  id: a[0],
  s: a[1],
  q: a[2],
  ok: a[3],
  w: [a[4], a[5]],
}));
export const QI = new Map(Q.map((q) => [q.id, q]));

/* Doppioni identici: stessa domanda e stessa risposta esatta = una sola carta di studio */
const LK = JSON.parse(rawL) as { can: Record<string, number>; tw: Record<string, number[]> };
export const CAN = (id: number): number => LK.can[id] || id;
export const MEM = new Map<number, number[]>();
Q.forEach((q) => {
  const c = CAN(q.id);
  if (!MEM.has(c)) MEM.set(c, []);
  MEM.get(c)!.push(q.id);
});
export const CARDS = Q.filter((q) => CAN(q.id) === q.id);
export const UN = CARDS.length;
export const TW = (id: number): number[] => LK.tw[CAN(id)] || [];

/* Ordine delle nuove: materie mescolate in proporzione al peso */
export const CURR: number[] = (() => {
  const L = SUBJ.map((_, i) => CARDS.filter((q) => q.s === i));
  const T = UN;
  const tk = L.map(() => 0);
  const o: number[] = [];
  for (let k = 0; k < T; k++) {
    let b = -1;
    let bv = -1e9;
    L.forEach((l, i) => {
      if (tk[i] >= l.length) return;
      const v = ((k + 1) * l.length) / T - tk[i];
      if (v > bv) {
        bv = v;
        b = i;
      }
    });
    o.push(L[b][tk[b]++].id);
  }
  return o;
})();
