import type { ReactNode } from "react";
import { cx } from "./cx";

/* Una riga dell'elenco domande (Errori e Database): dati, testo e risposta esatta. */
export function Quesito({
  meta,
  domanda,
  risposta,
  nascosta,
  onScopri,
}: {
  meta: ReactNode;
  domanda: ReactNode;
  risposta: ReactNode;
  nascosta?: boolean;
  onScopri?: () => void;
}) {
  return (
    <li className="flex flex-col gap-2 border-t border-riga py-4 first:border-t-0 first:pt-0">
      <p className="tnum m-0 flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-mut">{meta}</p>
      <p className="m-0 font-read text-[17px] leading-[1.45]">{domanda}</p>
      {nascosta ? (
        <button
          onClick={onScopri}
          className="rounded-[6px] border border-dashed border-riga bg-transparent px-3 py-1.5 text-left text-[13px] font-semibold text-mut hover:border-mut hover:text-ink"
        >
          Tocca per scoprire la risposta
        </button>
      ) : (
        <p className={cx("m-0 border-l-[3px] border-ok pl-3 font-read text-[15px] leading-[1.45] text-ok")}>{risposta}</p>
      )}
    </li>
  );
}
