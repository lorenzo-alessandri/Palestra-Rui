import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { today } from "../core/dates";
import { makePlan } from "../core/plan";
import { useS } from "../store/store";
import { Bolla } from "../ui/Bolla";
import { cx } from "../ui/cx";
import { TemaCiclo, TemaSwitch } from "../ui/TemaSwitch";
import { TABS, type Tab } from "./nav";

function giorni(d: number) {
  return d > 1 ? `${d} giorni all'esame` : d === 1 ? "1 giorno all'esame" : d === 0 ? "Oggi è il giorno dell'esame" : "Esame concluso";
}

export function Shell({ tab, go, children }: { tab: Tab; go: (t: Tab) => void; children: ReactNode }) {
  const S = useS();
  const plan = makePlan(S.cfg.exam, S.cfg.since);
  const left = plan ? plan.exam - today() : null;

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[236px_minmax(0,1fr)]">
      {/* Computer: colonna laterale */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-riga px-5 py-6 lg:flex">
        <div>
          <div className="text-[21px] font-semibold leading-tight tracking-[-0.01em]">Palestra RUI</div>
          <div className="text-[13px] text-mut">Prova IVASS, modulo assicurativo</div>
        </div>
        <nav aria-label="Sezioni" className="mt-8 flex flex-col gap-0.5">
          {TABS.map(({ k, l }) => (
            <button
              key={k}
              onClick={() => go(k)}
              aria-current={tab === k ? "page" : undefined}
              className={cx(
                "flex h-10 items-center gap-3 rounded-tasto border-0 px-2 text-left text-[15px] transition-colors",
                tab === k ? "bg-foglio font-semibold text-ink" : "bg-transparent text-mut hover:text-ink",
              )}
            >
              <Bolla size={14} stato={tab === k ? "piena" : "vuota"} />
              {l}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {left !== null && <div className="tnum text-[13px] font-semibold">{giorni(left)}</div>}
          <TemaSwitch />
          <div className="text-[12px] leading-snug text-mut">Progressi salvati in questo browser</div>
        </div>
      </aside>

      {/* Telefono: intestazione */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-riga bg-carta px-4 lg:hidden">
        <div className="min-w-0">
          <div className="text-[17px] font-semibold leading-tight">Palestra RUI</div>
          {left !== null && <div className="tnum truncate text-[12px] text-mut">{giorni(left)}</div>}
        </div>
        <div className="flex items-center">
          <TemaCiclo />
          <button
            onClick={() => go("metodo")}
            aria-label="Metodo"
            aria-current={tab === "metodo" ? "page" : undefined}
            className={cx("grid h-10 w-10 place-items-center rounded-tasto border-0 bg-transparent", tab === "metodo" ? "text-blu" : "text-mut hover:text-ink")}
          >
            <BookOpen size={18} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1080px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">{children}</main>

      {/* Telefono: barra in basso */}
      <nav aria-label="Sezioni" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-riga bg-foglio pb-[env(safe-area-inset-bottom)] lg:hidden">
        {TABS.filter((t) => t.k !== "metodo").map(({ k, l, I }) => (
          <button
            key={k}
            onClick={() => go(k)}
            aria-current={tab === k ? "page" : undefined}
            className={cx(
              "flex h-14 min-w-0 flex-col items-center justify-center gap-0.5 border-0 bg-transparent text-[11px]",
              tab === k ? "font-semibold text-blu" : "text-mut",
            )}
          >
            <I size={20} strokeWidth={tab === k ? 2.1 : 1.75} />
            <span className="max-w-full truncate px-0.5">{l}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
