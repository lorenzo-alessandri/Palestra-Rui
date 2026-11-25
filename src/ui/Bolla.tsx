import type { ReactNode } from "react";
import { cx } from "./cx";

/* La bolla della scheda risposte: vuota, annerita con la penna, giusta o sbagliata. */
export type BollaStato = "vuota" | "piena" | "giusta" | "sbagliata";
const ST: Record<BollaStato, string> = {
  vuota: "border-riga text-mut bg-transparent",
  piena: "border-blu bg-blu text-su-blu",
  giusta: "border-ok bg-ok text-foglio",
  sbagliata: "border-ko bg-ko text-foglio",
};

export function Bolla({ stato = "vuota", size = 28, children }: { stato?: BollaStato; size?: number; children?: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.46)) }}
      className={cx("tnum grid flex-none font-sans place-items-center rounded-full border-[1.5px] font-semibold leading-none transition-colors", ST[stato])}
    >
      {children}
    </span>
  );
}
