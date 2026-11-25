import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QI, SUBJ } from "../core/data";
import { fd } from "../core/dates";
import type { SimRec } from "../core/leitner";
import type { Tab } from "../shell/nav";
import { session } from "../store/session";
import { fmtT, N_SIM, simLeft, simStore, SOGLIA, useSim, type Sim, type SimRes } from "../store/sim";
import { useS } from "../store/store";
import { Bolla } from "../ui/Bolla";
import { Button } from "../ui/Button";
import { cx } from "../ui/cx";
import { Foglio } from "../ui/Foglio";
import { Opzione } from "../ui/Opzione";
import { Revisione, type RevItem } from "../ui/Revisione";
import { Timbro } from "../ui/Timbro";

const L = ["A", "B", "C"];
const it = (n: number) => n.toLocaleString("it-IT");

/* ---------- Risultato (dal vivo o dallo storico) ---------- */
function Esito({ r, vivo }: { r: SimRes; vivo?: boolean }) {
  const pass = r.sc >= SOGLIA;
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="tnum m-0 text-[72px] font-semibold leading-none tracking-[-0.03em]" aria-label={`${r.sc} su 100`}>
          {r.sc}
          <span className="text-[21px] font-normal tracking-normal text-mut">/100</span>
        </p>
        <Timbro idoneo={pass} vivo={vivo} />
      </div>
      <dl className="m-0 mt-5 grid grid-cols-3 gap-2.5">
        {[
          [r.c, "giuste", `+${it(r.c)}`, "text-ok"],
          [r.w, "sbagliate", `−${it(r.w / 2)}`, "text-ko"],
          [r.o, "in bianco", vivo && r.mins != null ? `${r.mins} min usati` : "", "text-ink"],
        ].map(([v, l, d, c]) => (
          <div key={l as string} className="rounded-tasto border border-riga px-3.5 py-3">
            <dd className={`tnum m-0 text-[28px] font-semibold leading-none ${c}`}>{v}</dd>
            <dt className="mt-1.5 text-[13px] leading-snug text-mut">
              {l} {d && <span className="tnum whitespace-nowrap">({d})</span>}
            </dt>
          </div>
        ))}
      </dl>
      <div className="mt-5 overflow-x-auto">
        <table className="tnum w-full border-collapse text-[15px]">
          <thead>
            <tr className="text-left text-[13px] text-mut">
              <th className="border-b border-riga py-2 pr-3 font-semibold">Materia</th>
              <th className="border-b border-riga px-3 py-2 text-right font-semibold">Giuste</th>
              <th className="border-b border-riga px-3 py-2 text-right font-semibold">Sbagliate</th>
              <th className="border-b border-riga py-2 pl-3 text-right font-semibold">Bianche</th>
            </tr>
          </thead>
          <tbody>
            {SUBJ.map((s, i) => {
              const p = r.per[i] || [0, 0, 0];
              return (
                <tr key={i}>
                  <td className="border-b border-riga py-2 pr-3">{s.s}</td>
                  <td className="border-b border-riga px-3 py-2 text-right">
                    {p[0]}/{p[0] + p[1] + p[2]}
                  </td>
                  <td className="border-b border-riga px-3 py-2 text-right">{p[1]}</td>
                  <td className="border-b border-riga py-2 pl-3 text-right">{p[2]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

const mancate = (items: RevItem[]) => items.filter((x) => x.a !== QI.get(x.id)!.ok).map((x) => x.id);
const daArchivio = (s: SimRec): RevItem[] =>
  s.q!.map(([id, k], n) => {
    const q = QI.get(id)!;
    return { n: n + 1, id, a: k === -1 ? undefined : k === 0 ? q.ok : q.w[k - 1] };
  });

/* ---------- Schermata Simulazione fuori dalla prova ---------- */
export function SimulazioneFerma({ go }: { go: (t: Tab) => void }) {
  const S = useS();
  const { sim } = useSim();
  const [vista, setVista] = useState<number | null>(null);
  const allena = (ids: number[]) => {
    if (session.startDrill(ids, "Errori della simulazione")) go("studio");
  };

  /* Risultato della simulazione appena consegnata */
  if (sim && sim.done && sim.res) {
    const items = sim.ids.map((id, n) => ({ n: n + 1, id, a: sim.ans[id] }));
    const bad = mancate(items);
    return (
      <div className="flex flex-col gap-5">
        <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Risultato</h1>
        <Foglio>
          <Esito r={sim.res} vivo />
          <p className="mb-0 mt-4 text-[13px] text-mut">Le domande sbagliate o lasciate in bianco sono entrate nei ripassi di domani.</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              disabled={!bad.length}
              onClick={() => {
                simStore.close();
                allena(bad);
              }}
            >
              Allena subito le {bad.length} mancate
            </Button>
            <Button onClick={() => simStore.start()}>Nuova simulazione</Button>
            <Button variant="ghost" onClick={() => simStore.close()}>
              Chiudi il risultato
            </Button>
          </div>
        </Foglio>
        <Revisione items={items} />
      </div>
    );
  }

  /* Una simulazione dello storico */
  const arch = vista !== null ? S.sims[vista] : null;
  if (arch && arch.q) {
    const items = daArchivio(arch);
    const bad = mancate(items);
    return (
      <div className="flex flex-col gap-5">
        <div>
          <button onClick={() => setVista(null)} className="-ml-1 mb-1 flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-semibold text-blu underline-offset-4 hover:underline">
            <ArrowLeft size={14} aria-hidden="true" /> Storico
          </button>
          <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Simulazione di {fd(arch.d, { weekday: "long", month: "long" })}</h1>
        </div>
        <Foglio>
          <Esito r={arch} />
          <Button variant="primary" className="mt-4" disabled={!bad.length} onClick={() => allena(bad)}>
            Allena le {bad.length} mancate
          </Button>
        </Foglio>
        <Revisione items={items} />
      </div>
    );
  }

  const best = S.sims.length ? Math.max(...S.sims.map((s) => s.sc)) : null;
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Simulazione d'esame</h1>
      <Foglio>
        <p className="m-0 max-w-[68ch]">
          50 quesiti estratti a caso da tutto il database del modulo assicurativo, 75 minuti. Punteggio come all'esame:{" "}
          <strong className="font-semibold">+1</strong> giusta, <strong className="font-semibold">0</strong> in bianco,{" "}
          <strong className="font-semibold">−0,5</strong> sbagliata. Idoneità con <strong className="font-semibold">60/100</strong>, cioè 30 punti su 50.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button variant="primary" onClick={() => simStore.start()}>
            Inizia la simulazione
          </Button>
          {best !== null && (
            <span className="tnum text-[13px] text-mut">
              Migliore finora: <strong className="font-semibold text-ink">{best}/100</strong>, {S.sims.length} fatte
            </span>
          )}
        </div>
      </Foglio>

      <Foglio title="Come sono divise le 50 domande">
        <ul className="tnum m-0 grid list-none gap-x-8 p-0 sm:grid-cols-2">
          {SUBJ.map((s) => (
            <li key={s.n} className="flex items-baseline justify-between gap-3 border-b border-riga py-2">
              <span>{s.s}</span>
              <span className="font-semibold">{s.k}</span>
            </li>
          ))}
        </ul>
        <p className="mb-0 mt-3 max-w-[68ch] text-[13px] text-mut">
          IVASS non pubblica una ripartizione per materia: qui le 50 domande sono divise in proporzione al peso di ogni materia nel database.
        </p>
      </Foglio>

      {S.sims.length > 0 && (
        <Foglio title="Storico">
          <div className="overflow-x-auto">
            <table className="tnum w-full border-collapse text-[15px]">
              <thead>
                <tr className="text-left text-[13px] text-mut">
                  <th className="border-b border-riga py-2 pr-3 font-semibold">Data</th>
                  <th className="border-b border-riga px-2 py-2 text-right font-semibold">Giuste</th>
                  <th className="border-b border-riga px-2 py-2 text-right font-semibold">Sbagliate</th>
                  <th className="border-b border-riga px-2 py-2 text-right font-semibold">Bianche</th>
                  <th className="border-b border-riga px-2 py-2 text-right font-semibold">Punteggio</th>
                  <th className="border-b border-riga py-2 pl-2" />
                </tr>
              </thead>
              <tbody>
                {S.sims
                  .map((s, k) => [s, k] as const)
                  .reverse()
                  .map(([s, k]) => (
                    <tr key={k}>
                      <td className="whitespace-nowrap border-b border-riga py-2 pr-3">{fd(s.d, { weekday: "short" })}</td>
                      <td className="border-b border-riga px-2 py-2 text-right">{s.c}</td>
                      <td className="border-b border-riga px-2 py-2 text-right">{s.w}</td>
                      <td className="border-b border-riga px-2 py-2 text-right">{s.o}</td>
                      <td className={cx("border-b border-riga px-2 py-2 text-right font-semibold", s.sc >= SOGLIA ? "text-ok" : "text-ko")}>{s.sc}</td>
                      <td className="border-b border-riga py-1 pl-2 text-right">
                        {s.q ? (
                          <Button small variant="ghost" className="text-blu" onClick={() => { setVista(k); scrollTo(0, 0); }}>
                            Rivedi
                          </Button>
                        ) : (
                          <span className="text-[13px] text-mut">senza dettaglio</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {S.sims.some((s) => !s.q) && (
            <p className="mb-0 mt-3 text-[13px] text-mut">Le simulazioni importate da versioni precedenti non hanno salvato le singole domande e non si possono rivedere.</p>
          )}
        </Foglio>
      )}
    </div>
  );
}

/* ---------- Prova in corso: a tutto schermo ---------- */
export function SimulazioneInCorso({ sim }: { sim: Sim }) {
  const [, tick] = useState(0);
  const [conferma, setConferma] = useState(false);
  const left = simLeft(sim);

  useEffect(() => {
    const h = setInterval(() => {
      const s = simStore.get().sim;
      if (!s || s.done) return;
      if (simLeft(s) <= 0) simStore.submit();
      else tick((n) => n + 1);
    }, 1000);
    return () => clearInterval(h);
  }, []);
  useEffect(() => {
    if (left <= 0) simStore.submit();
  });
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tg = ev.target as HTMLElement;
      if (tg.matches?.("input,select,textarea") || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const s = simStore.get().sim;
      if (!s || s.done) return;
      const m = ({ "1": 0, "2": 1, "3": 2, a: 0, b: 1, c: 2 } as Record<string, number>)[ev.key.toLowerCase()];
      if (m !== undefined) {
        ev.preventDefault();
        simStore.toggle(m);
      } else if (ev.key === "ArrowRight") simStore.goto(s.cur + 1);
      else if (ev.key === "ArrowLeft") simStore.goto(s.cur - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const id = sim.ids[sim.cur];
  const q = QI.get(id)!;
  const a = sim.ans[id];
  const nAns = Object.keys(sim.ans).length;
  const bianche = N_SIM - nAns;
  const low = left < 5 * 60e3;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-riga bg-carta">
        <div className="mx-auto flex min-h-14 max-w-[1080px] items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <p className="m-0 flex items-baseline gap-3">
            <span role="timer" aria-label="Tempo rimasto" className={cx("tnum text-[28px] font-semibold leading-none", low ? "text-ko" : "text-ink")}>
              {fmtT(left)}
            </span>
            <span className="tnum text-[13px] text-mut">
              {nAns} {nAns === 1 ? "risposta" : "risposte"}, {bianche} in bianco
            </span>
          </p>
          <Button variant="danger" small onClick={() => setConferma(true)}>
            Consegna
          </Button>
        </div>
        {conferma && (
          <div className="border-t border-riga bg-amb-soft">
            <div role="alertdialog" aria-label="Conferma consegna" className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-amb sm:px-6">
              <span className="font-semibold">
                Consegnare adesso?{bianche > 0 && ` Hai ${bianche} ${bianche === 1 ? "domanda" : "domande"} in bianco.`}
              </span>
              <span className="flex gap-2">
                <Button variant="danger" small onClick={() => simStore.submit()}>
                  Sì, consegna
                </Button>
                <Button small onClick={() => setConferma(false)}>
                  Continua
                </Button>
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto grid max-w-[1080px] items-start gap-4 px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_304px] lg:gap-6">
        <article className="rounded-foglio border border-riga bg-foglio p-4 sm:p-7">
          <p className="tnum m-0 flex flex-wrap gap-x-3 text-[13px] text-mut">
            <span>
              Domanda {sim.cur + 1} di {N_SIM}
            </span>
            <span>{SUBJ[q.s].s}</span>
          </p>
          <h1 className="mb-5 mt-3 text-pretty font-read text-[19px] font-normal leading-[1.45] sm:mb-6 sm:text-[21px]">{q.q}</h1>
          <div className="flex flex-col gap-2.5">
            {sim.opts[id].map((o, k) => (
              <Opzione key={k} lettera={L[k]} testo={o} stato={a === o ? "scelta" : "libera"} onClick={() => simStore.toggle(k)} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex gap-2.5">
              <Button disabled={sim.cur === 0} onClick={() => simStore.goto(sim.cur - 1)}>
                <ArrowLeft size={16} aria-hidden="true" /> Indietro
              </Button>
              <Button variant="primary" disabled={sim.cur === N_SIM - 1} onClick={() => simStore.goto(sim.cur + 1)}>
                Avanti <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
            {a !== undefined && (
              <Button variant="ghost" className="text-mut" onClick={() => simStore.clear()}>
                Lascia in bianco
              </Button>
            )}
          </div>
        </article>

        <aside className="rounded-foglio border border-riga bg-foglio p-4 lg:sticky lg:top-[76px]">
          <h2 className="m-0 mb-3 text-[15px] font-semibold">Scheda risposte</h2>
          <div className="grid grid-cols-10 gap-x-1 gap-y-1.5 lg:grid-cols-5 lg:gap-y-2">
            {sim.ids.map((x, i) => {
              const fatto = sim.ans[x] !== undefined;
              return (
                <button
                  key={x}
                  onClick={() => simStore.goto(i)}
                  aria-label={`Domanda ${i + 1}${fatto ? ", risposta data" : ", in bianco"}`}
                  aria-current={i === sim.cur ? "true" : undefined}
                  className="grid h-9 place-items-center rounded-full border-0 bg-transparent p-0"
                >
                  <span className={cx("rounded-full", i === sim.cur && "outline outline-2 outline-offset-2 outline-ink")}>
                    <Bolla size={28} stato={fatto ? "piena" : "vuota"}>
                      {i + 1}
                    </Bolla>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mb-0 mt-4 text-[13px] leading-snug text-mut">
            Rispondi se riesci a escludere almeno un'opzione; al buio totale lascia in bianco.
          </p>
        </aside>
      </main>
    </div>
  );
}
