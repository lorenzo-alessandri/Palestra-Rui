/* I giorni sono numeri interi: giorni dal 1/1/1970, calcolati sulla data locale del dispositivo. */
export const D = (s: string): number => {
  const [y, m, d] = s.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 864e5);
};
export const dn = (d: Date): number => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
export const today = (): number => dn(new Date());
export const fd = (n: number, o?: Intl.DateTimeFormatOptions): string =>
  new Date(n * 864e5).toLocaleDateString("it-IT", { day: "numeric", month: "short", timeZone: "UTC", ...o });
export const iso = (n: number): string => new Date(n * 864e5).toISOString().slice(0, 10);
/* Numero con il punto delle migliaia: 1.607 */
export const num = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
