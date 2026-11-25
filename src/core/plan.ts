/* Calendario di studio. La data d'esame è facoltativa: senza data non ci sono fasi.
   Le durate ricalcano il piano originale: consolidamento negli ultimi 24 giorni,
   rifinitura negli ultimi 4, tutto il tempo prima è la prima passata. */
export interface Plan {
  exam: number;
  start: number;
  p1End: number;
  p2End: number;
}

export function makePlan(exam?: number, since?: number): Plan | null {
  if (exam == null) return null;
  return { exam, start: Math.min(since ?? exam - 54, exam - 54), p1End: exam - 25, p2End: exam - 5 };
}

/* 1 prima passata · 2 consolidamento · 3 rifinitura · 4 giorno dell'esame · 5 concluso */
export function phase(p: Plan, t: number): 1 | 2 | 3 | 4 | 5 {
  if (t <= p.p1End) return 1;
  if (t <= p.p2End) return 2;
  if (t < p.exam) return 3;
  return t === p.exam ? 4 : 5;
}

export const PH: Record<number, { n: string; g: string }> = {
  1: { n: "Prima passata", g: "Vedi tutte le domande almeno una volta, mescolate per materia, più i ripassi in scadenza." },
  2: { n: "Consolidamento", g: "Niente più domande nuove salvo arretrati: ripassi, errori e una simulazione a giorni alterni." },
  3: { n: "Rifinitura", g: "Una simulazione al giorno, poi solo errori e numeri. Il giorno prima dell'esame, ripasso leggero." },
  4: { n: "Giorno dell'esame", g: "In bocca al lupo." },
  5: { n: "Esame concluso", g: "Se ti prepari per una nuova edizione, imposta la nuova data." },
};

/* Giorno di simulazione consigliato: a giorni alterni in consolidamento, ogni giorno in rifinitura */
export function simDay(p: Plan, t: number): boolean {
  const ph = phase(p, t);
  if (ph === 3) return true;
  if (ph === 2) return (t - (p.p1End + 1)) % 2 === 0;
  return false;
}
