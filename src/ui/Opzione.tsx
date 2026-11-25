import { Bolla, type BollaStato } from "./Bolla";
import { cx } from "./cx";

/* Un'opzione di risposta: bolla con la lettera e testo. */
export type OpzStato = "libera" | "scelta" | "giusta" | "sbagliata" | "spenta";
const BOX: Record<OpzStato, string> = {
  libera: "border-riga bg-foglio hover:border-blu",
  scelta: "border-blu bg-blu-soft",
  giusta: "border-ok bg-ok-soft",
  sbagliata: "border-ko bg-ko-soft",
  spenta: "border-riga bg-foglio opacity-55",
};
const BOL: Record<OpzStato, BollaStato> = { libera: "vuota", scelta: "piena", giusta: "giusta", sbagliata: "sbagliata", spenta: "vuota" };

export function Opzione({
  lettera,
  testo,
  stato = "libera",
  disabled,
  nota,
  onClick,
}: {
  lettera: string;
  testo: string;
  stato?: OpzStato;
  disabled?: boolean;
  nota?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${lettera}. ${testo}${nota ? ` (${nota})` : ""}`}
      className={cx(
        "flex w-full items-start gap-3 rounded-tasto border px-3.5 py-3 text-left font-read text-[16px] leading-[1.45] sm:text-[17px] text-ink transition-colors disabled:cursor-default",
        BOX[stato],
      )}
    >
      <Bolla stato={BOL[stato]}>{lettera}</Bolla>
      <span className="min-w-0 pt-px">
        {testo}
        {nota && <span className="ml-2 whitespace-nowrap font-sans text-[13px] font-semibold">{nota}</span>}
      </span>
    </button>
  );
}
