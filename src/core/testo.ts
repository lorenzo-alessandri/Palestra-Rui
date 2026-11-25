/* Ricerca senza accenti e filtri pronti del Database. */
export const norm = (s: string): string => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export const NUMRE = /\d/;
export const NOTRE = /\bNON\b/;
export const ABSRE = /\b(sempre|mai)\b/i;

/* Spezza un testo in parti, segnando quelle che corrispondono alla ricerca (accenti ignorati). */
export function evidenzia(s: string, cerca: string): { t: string; hit: boolean }[] {
  const nt = norm(cerca.trim());
  if (nt.length < 2) return [{ t: s, hit: false }];
  /* testo normalizzato + posizione di ogni suo carattere nell'originale */
  let ns = "";
  const pos: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const n = norm(s[i]);
    for (let k = 0; k < n.length; k++) pos.push(i);
    ns += n;
  }
  pos.push(s.length);
  const out: { t: string; hit: boolean }[] = [];
  let i = 0;
  let from = 0;
  let j: number;
  while ((j = ns.indexOf(nt, from)) >= 0) {
    const a = pos[j];
    const b = pos[j + nt.length - 1] + 1;
    if (a > i) out.push({ t: s.slice(i, a), hit: false });
    out.push({ t: s.slice(a, b), hit: true });
    i = b;
    from = j + nt.length;
  }
  if (i < s.length) out.push({ t: s.slice(i), hit: false });
  return out;
}
