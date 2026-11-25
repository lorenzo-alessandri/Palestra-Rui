import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { CAN, MEM, QI, SUBJ } from "../core/data";
import { num, today } from "../core/dates";
import { dueIds, hasErrors, IV, unseenCount } from "../core/leitner";
import type { Tab } from "../shell/nav";
import { MODES, session, useSession, type Mode, type Sess } from "../store/session";
import { useS } from "../store/store";
import { Button } from "../ui/Button";
import { Foglio } from "../ui/Foglio";
import { Gemelle } from "../ui/Gemelle";
import { Modi } from "../ui/Modi";
import { Opzione, type OpzStato } from "../ui/Opzione";

const L = ["A", "B", "C"];
const Kbd = ({ children }: { children: string }) => (
  <kbd className="tnum rounded-[4px] border border-current px-1.5 font-sans text-[11px] font-semibold opacity-70">{children}</kbd>
);

/* Schermata Studio quando non c'è una sessione in corso: riepilogo dell'ultima, oppure scelta del modo. */
export function StudioFermo({ go, onStart }: { go: (t: Tab) => void; onStart: (m: Mode) => void }) {
  const S = useS();
  const { fine } = useSession();
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Studio</h1>
      {fine && (
        <Foglio title="Sessione chiusa" aside={fine.label}>
          <dl className="m-0 grid grid-cols-3 gap-2.5">
            {[
              [num(fine.n), "domande"],
              [num(fine.right), "giuste al primo colpo"],
              [`${fine.n ? Math.round((fine.right / fine.n) * 100) : 0}%`, "precisione"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-tasto border border-riga px-3.5 py-3">
                <dd className="tnum m-0 text-[28px] font-semibold leading-none">{v}</dd>
                <dt className="mt-1.5 text-[13px] leading-snug text-mut">{l}</dt>
              </div>
            ))}
          </dl>
          {fine.rest.length > 0 && (
            <Button variant="primary" className="mt-4" onClick={() => session.startDrill(fine.rest, fine.label)}>
              Continua ({fine.rest.length} rimaste)
            </Button>
          )}
        </Foglio>
      )}
      <Foglio title={fine ? "Continua a studiare" : "Scegli come studiare"}>
        <Modi S={S} onStart={onStart} />
        <div className="mt-4 flex flex-wrap gap-2.5">
          {hasErrors(S) && <Button onClick={() => go("errori")}>Allena gli errori</Button>}
          <Button variant="ghost" onClick={() => go("oggi")}>
            Torna a Oggi
          </Button>
        </div>
      </Foglio>
    </div>
  );
}

/* Sessione in corso: a tutto schermo, senza navigazione. */
export function StudioSessione({ sess }: { sess: Sess }) {
  const S = useS();
  const avanti = useRef<HTMLButtonElement>(null);
  const it = sess.cur!;
  const q = QI.get(it.m!)!;
  const e = S.p[CAN(q.id)];
  const ans = sess.answered;
  const ok = ans === q.ok;
  const t = today();

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tg = ev.target as HTMLElement;
      if (tg.matches?.("input,select,textarea") || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const k = ev.key.toLowerCase();
      const m = ({ "1": 0, "2": 1, "3": 2, a: 0, b: 1, c: 2 } as Record<string, number>)[k];
      const s = session.get().sess;
      if (!s || !s.cur) return;
      if (s.answered === null) {
        if (m !== undefined && s.opts) {
          ev.preventDefault();
          session.answer(s.opts[m]);
        } else if (k === "0" || k === "n") {
          ev.preventDefault();
          session.answer("");
        }
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        session.next();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (ans !== null) avanti.current?.focus({ preventScroll: true });
    else scrollTo(0, 0);
  }, [ans, it]);

  const etichetta = it.retry ? "di nuovo" : sess.box < 0 ? (it.twin ? "nuova, gemella della precedente" : "nuova") : `ripasso, livello ${sess.box}`;
  const etiColor = it.retry || it.twin ? "text-amb" : "text-blu";
  const copie = (MEM.get(CAN(q.id)) || []).filter((x) => x !== q.id);
  const testa =
    sess.kind === "daily"
      ? `${MODES[sess.mode!]}: ${num(dueIds(S, t).length)} ripassi rimasti, ${num(unseenCount(S))} nuove da vedere`
      : `${sess.label}: ${sess.list!.length} da fare`;

  let titolo = "";
  let msg = "";
  if (ans !== null) {
    titolo = ok ? "Esatto" : ans === "" ? "Da imparare" : "Sbagliato";
    if (ok) {
      const g = IV[e ? e[0] : 1];
      msg = it.retry ? "Recuperata." : g === 1 ? "Torna domani." : `Torna tra ${g} giorni.`;
    } else msg = it.retry && (it.tries || 0) >= 2 ? "La rivedi domani." : "La rivedi tra 5 carte e di nuovo domani.";
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-riga bg-carta">
        <div className="mx-auto flex min-h-14 max-w-[760px] items-center gap-3 px-4 py-2 sm:px-6">
          <button
            onClick={() => session.end()}
            className="-ml-2 flex h-10 flex-none items-center gap-1.5 rounded-tasto border-0 bg-transparent px-2 text-[15px] font-semibold text-ink hover:bg-blu-soft"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
            Esci
          </button>
          <p className="tnum m-0 min-w-0 flex-1 text-[13px] leading-snug text-mut">
            {testa}
            {sess.retries.length > 0 && `, ${sess.retries.length} da ripetere`}
          </p>
          <p className="tnum m-0 flex-none text-right text-[13px] font-semibold leading-snug" aria-label={`${sess.right} giuste, ${sess.wrong} sbagliate`}>
            <span className="text-ok">{sess.right} giuste</span>
            <span className="block text-ko sm:ml-3 sm:inline">{sess.wrong} sbagliate</span>
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
        <article className="rounded-foglio border border-riga bg-foglio p-4 sm:p-7">
          <p className="tnum m-0 flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-mut">
            <span>Quesito n. {q.id}</span>
            <span>{SUBJ[q.s].s}</span>
            <span className={`font-semibold ${etiColor}`}>{etichetta}</span>
            {e && e[2] + e[3] > 0 && (
              <span>
                finora {e[2]} {e[2] === 1 ? "giusta" : "giuste"}, {e[3]} {e[3] === 1 ? "sbagliata" : "sbagliate"}
              </span>
            )}
            {copie.length > 0 && <span>identica ai n. {copie.join(", ")}</span>}
          </p>
          <h1 className="mb-5 mt-3 text-pretty font-read text-[19px] font-normal leading-[1.45] sm:mb-6 sm:text-[21px]">{q.q}</h1>

          <div className="flex flex-col gap-2.5">
            {sess.opts!.map((o, k) => {
              let st: OpzStato = "libera";
              if (ans !== null) st = o === q.ok ? "giusta" : o === ans ? "sbagliata" : "spenta";
              return <Opzione key={k} lettera={L[k]} testo={o} stato={st} disabled={ans !== null} onClick={() => session.answer(o)} />;
            })}
          </div>

          {ans === null ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button variant="ghost" className="-ml-2 text-mut" onClick={() => session.answer("")}>
                Non lo so <Kbd>0</Kbd>
              </Button>
              <span className="hidden items-center gap-1.5 text-[13px] text-mut sm:flex">
                Tasti <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> oppure A B C
              </span>
            </div>
          ) : (
            <div
              role="status"
              className={`sticky bottom-3 mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-tasto px-4 py-3 ${ok ? "bg-ok-soft text-ok" : "bg-ko-soft text-ko"}`}
            >
              <p className="m-0">
                <strong className="text-[17px] font-semibold">{titolo}.</strong> <span className="text-[15px]">{msg}</span>
              </p>
              <Button ref={avanti} variant="primary" className="w-full sm:w-auto" onClick={() => session.next()}>
                Avanti <Kbd>Invio</Kbd>
              </Button>
            </div>
          )}
        </article>

        {ans !== null && <Gemelle id={q.id} />}

        <p className="m-0 text-[13px] text-mut">Ogni risposta è già salvata: puoi uscire quando vuoi.</p>
      </main>
    </div>
  );
}
