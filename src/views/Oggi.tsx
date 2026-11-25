import { useState, type FormEvent } from "react";
import { D, fd, iso, num, today } from "../core/dates";
import { UN } from "../core/data";
import { blank, didSimToday, hasErrors, seenCount } from "../core/leitner";
import { makePlan, PH, phase, simDay } from "../core/plan";
import type { Tab } from "../shell/nav";
import { store, useS } from "../store/store";
import { Button } from "../ui/Button";
import { Fasi } from "../ui/Fasi";
import { Foglio } from "../ui/Foglio";
import { Giorni, SimBarre } from "../ui/Grafici";
import { Modi } from "../ui/Modi";
import type { Mode } from "../store/session";
import { Copertura } from "../ui/Copertura";

export function Oggi({ go, onStart }: { go: (t: Tab) => void; onStart: (m: Mode) => void }) {
  const S = useS();
  const t = today();
  const plan = makePlan(S.cfg.exam, S.cfg.since);
  const seen = seenCount(S);
  const fatte = S.log[t]?.[0] ?? 0;
  const consolidate = Object.values(S.p).filter((e) => e[0] >= 3).length;
  const simOggi = !!plan && simDay(plan, t) && !didSimToday(S, t);
  const sims = S.sims;

  return (
    <div className="flex flex-col gap-5">
      {store.isDemo() && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-foglio bg-amb-soft px-4 py-2.5 text-[13px] text-amb">
          <span>Anteprima con progressi di esempio: niente viene salvato.</span>
          <Button small onClick={() => store.replace(blank())}>
            Parti da zero
          </Button>
        </div>
      )}

      <Testata />

      <Foglio title="Il lavoro di oggi" aside={fatte ? `${num(fatte)} risposte date oggi` : undefined}>
        {simOggi && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-tasto bg-amb-soft px-4 py-3 text-amb">
            <span>
              <strong className="font-semibold">Oggi è giorno di simulazione.</strong> 50 domande, 75 minuti.
            </span>
            <Button small onClick={() => go("simulazione")}>
              Vai alla simulazione
            </Button>
          </div>
        )}
        <Modi S={S} onStart={onStart} />
        <p className="mb-0 mt-4 max-w-[68ch] text-[13px] text-mut">
          I ripassi sono le domande già viste che scadono oggi; le nuove non hanno un limite giornaliero e arrivano con la loro gemella. Puoi uscire quando
          vuoi: ogni risposta è salvata.
        </p>
        {hasErrors(S) && (
          <button onClick={() => go("errori")} className="mt-3 border-0 bg-transparent p-0 text-[15px] font-semibold text-blu underline-offset-4 hover:underline">
            Allena gli errori
          </button>
        )}
      </Foglio>

      <Foglio title="Copertura per materia" aside={`${num(seen)} viste su ${num(UN)}, ${num(consolidate)} consolidate`}>
        <Copertura S={S} />
      </Foglio>

      <div className="grid gap-5 md:grid-cols-2">
        <Foglio title="Simulazioni">
          {sims.length ? (
            <>
              <SimBarre sims={sims} />
              <p className="tnum mb-0 mt-3 text-[13px] text-mut">
                Ultima: <strong className="font-semibold text-ink">{sims[sims.length - 1].sc}/100</strong> il {fd(sims[sims.length - 1].d)}
                {sims.length >= 3 && (
                  <>
                    . Media delle ultime 3:{" "}
                    <strong className="font-semibold text-ink">{Math.round(sims.slice(-3).reduce((a, s) => a + s.sc, 0) / 3)}/100</strong>
                  </>
                )}
                . La linea tratteggiata è la soglia di idoneità.
              </p>
            </>
          ) : (
            <>
              <p className="m-0 text-[13px] text-mut">Nessuna simulazione ancora. La prima ti dice da dove parti: 50 domande in 75 minuti, come all'esame.</p>
              <Button small className="mt-3" onClick={() => go("simulazione")}>
                Fai una simulazione
              </Button>
            </>
          )}
        </Foglio>
        <Foglio title="Ultimi 28 giorni">
          <Giorni S={S} t={t} />
          <p className="mb-0 mt-3 text-[13px] text-mut">Una casella al giorno: più è scura, più domande hai fatto.</p>
        </Foglio>
      </div>
    </div>
  );
}

/* Testata: conto alla rovescia e fasi se c'è una data d'esame, altrimenti invito a impostarla. */
function Testata() {
  const S = useS();
  const t = today();
  const plan = makePlan(S.cfg.exam, S.cfg.since);
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  const apri = () => {
    setVal(plan ? iso(plan.exam) : "");
    setErr("");
    setEdit(true);
  };
  const salva = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return setErr("Scegli una data.");
    const exam = D(val);
    store.update((s) => {
      const primo = Object.keys(s.log).map(Number).sort((a, b) => a - b)[0];
      s.cfg = { exam, since: Math.min(primo ?? t, t) };
    });
    setEdit(false);
  };
  const togli = () => {
    store.update((s) => {
      s.cfg = {};
    });
    setEdit(false);
  };

  const form = edit && (
    <form onSubmit={salva} className="mt-3 flex flex-wrap items-end gap-2.5">
      <label className="flex flex-col gap-1 text-[13px] text-mut">
        Data dell'esame
        <input
          type="date"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setErr("");
          }}
          className="h-11 rounded-tasto border border-riga bg-foglio px-3 text-[15px] text-ink"
        />
      </label>
      <Button variant="primary" type="submit">
        Salva data
      </Button>
      {plan && (
        <Button type="button" onClick={togli}>
          Togli la data
        </Button>
      )}
      <Button variant="ghost" type="button" onClick={() => setEdit(false)}>
        Annulla
      </Button>
      {err && <p className="m-0 w-full text-[13px] text-ko">{err}</p>}
    </form>
  );

  if (!plan) {
    return (
      <header>
        <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Oggi</h1>
        <p className="m-0 text-mut first-letter:uppercase">{fd(t, { weekday: "long", month: "long" })}</p>
        {!edit && (
          <p className="mb-0 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mut">
            Hai già una data d'esame? Con la data vedi il conto alla rovescia e le fasi di studio.
            <Button small onClick={apri}>
              Imposta la data
            </Button>
          </p>
        )}
        {form}
      </header>
    );
  }

  const d = plan.exam - t;
  const ph = phase(plan, t);
  const titolo = d > 1 ? `Mancano ${d} giorni all'esame` : d === 1 ? "Manca 1 giorno all'esame" : d === 0 ? "Oggi è il giorno dell'esame" : "Esame concluso";
  return (
    <header>
      <h1 className="tnum m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">{titolo}</h1>
      <p className="m-0 flex flex-wrap items-center gap-x-3 text-mut">
        <span className="first-letter:uppercase">{fd(plan.exam, { weekday: "long", month: "long", year: "numeric" })}</span>
        {!edit && (
          <button onClick={apri} className="border-0 bg-transparent p-0 text-[13px] text-blu underline-offset-4 hover:underline">
            Cambia data
          </button>
        )}
      </p>
      {form}
      <p className="mb-4 mt-4 max-w-[68ch]">
        <strong className="font-semibold">{PH[ph].n}.</strong> {PH[ph].g}
      </p>
      <Fasi plan={plan} t={t} />
    </header>
  );
}
