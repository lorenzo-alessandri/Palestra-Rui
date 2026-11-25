import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CAN, MEM, Q, SUBJ, TW } from "../core/data";
import { num } from "../core/dates";
import { ABSRE, evidenzia, norm, NOTRE, NUMRE } from "../core/testo";
import type { Tab } from "../shell/nav";
import { session, shuffle } from "../store/session";
import { useS } from "../store/store";
import { Button } from "../ui/Button";
import { Foglio } from "../ui/Foglio";
import { Quesito } from "../ui/Quesito";

const PRESETS: Record<string, string> = {
  "": "Tutte le domande",
  num: "Numeri, termini e percentuali",
  non: "Domande con «NON»",
  abs: "Risposte con sempre o mai",
  unseen: "Mai viste",
  wrong: "Sbagliate almeno una volta",
  mast: "Consolidate",
};
/* Testo di ogni domanda già normalizzato, per la ricerca */
const QN = new Map(Q.map((q) => [q.id, norm(q.q + " " + q.ok + " " + q.w.join(" "))]));
const PAGINA = 40;

function Hl({ s, cerca }: { s: string; cerca: string }) {
  return (
    <>
      {evidenzia(s, cerca).map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded-[2px] bg-amb-soft text-inherit">
            {p.t}
          </mark>
        ) : (
          p.t
        ),
      )}
    </>
  );
}

const campo = "h-11 w-full min-w-0 rounded-tasto border border-riga bg-foglio px-3 text-[15px] text-ink";

export function Database({ go }: { go: (t: Tab) => void }) {
  const S = useS();
  const [cerca, setCerca] = useState("");
  const [materia, setMateria] = useState("");
  const [preset, setPreset] = useState("");
  const [nascondi, setNascondi] = useState(false);
  const [scoperte, setScoperte] = useState<Set<number>>(new Set());
  const [mostrate, setMostrate] = useState(PAGINA);
  const cercaLenta = useDeferredValue(cerca);

  const f = useMemo(() => {
    const t = norm(cercaLenta.trim());
    return Q.filter((q) => {
      if (materia !== "" && q.s !== +materia) return false;
      const e = S.p[CAN(q.id)];
      switch (preset) {
        case "num":
          if (!NUMRE.test(q.ok)) return false;
          break;
        case "non":
          if (!NOTRE.test(q.q)) return false;
          break;
        case "abs":
          if (!ABSRE.test(q.ok + " " + q.w.join(" "))) return false;
          break;
        case "unseen":
          if (e) return false;
          break;
        case "wrong":
          if (!e || !e[3]) return false;
          break;
        case "mast":
          if (!e || e[0] < 3) return false;
          break;
      }
      return !t || QN.get(q.id)!.includes(t);
    });
  }, [cercaLenta, materia, preset, S.p]);
  const diverse = useMemo(() => new Set(f.map((q) => CAN(q.id))).size, [f]);
  const reset = () => setMostrate(PAGINA);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Database</h1>
      <Foglio>
        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_190px_230px]">
          <label className="relative block">
            <span className="sr-only">Cerca nel database</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut" aria-hidden="true" />
            <input
              type="search"
              value={cerca}
              onChange={(e) => {
                setCerca(e.target.value);
                reset();
              }}
              placeholder="recesso, 60 giorni, sezione E"
              className={campo + " pl-9"}
            />
          </label>
          <select aria-label="Materia" value={materia} onChange={(e) => { setMateria(e.target.value); reset(); }} className={campo}>
            <option value="">Tutte le materie</option>
            {SUBJ.map((s, i) => (
              <option key={i} value={i}>
                {s.s}
              </option>
            ))}
          </select>
          <select aria-label="Filtro" value={preset} onChange={(e) => { setPreset(e.target.value); reset(); }} className={campo}>
            {Object.entries(PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <p className="tnum m-0 text-[13px] text-mut" role="status">
            {num(f.length)} {f.length === 1 ? "domanda" : "domande"}, {num(diverse)} diverse
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-[15px]">
              <input
                type="checkbox"
                checked={nascondi}
                onChange={(e) => {
                  setNascondi(e.target.checked);
                  setScoperte(new Set());
                }}
                className="h-4 w-4 accent-(--blu)"
              />
              Nascondi risposte
            </label>
            <Button
              variant="primary"
              disabled={!f.length}
              onClick={() => {
                if (session.startDrill(shuffle(f.map((q) => q.id)), "Allenamento mirato")) go("studio");
              }}
            >
              Allena questi ({num(diverse)})
            </Button>
          </div>
        </div>
      </Foglio>

      <Foglio>
        {!f.length ? (
          <p className="m-0 text-mut">Nessuna domanda con questi filtri. Prova a togliere un filtro o a cercare una parola più corta.</p>
        ) : (
          <>
            <ol className="m-0 list-none p-0">
              {f.slice(0, mostrate).map((q) => {
                const e = S.p[CAN(q.id)];
                const copie = (MEM.get(CAN(q.id)) || []).filter((x) => x !== q.id);
                const tw = TW(q.id);
                return (
                  <Quesito
                    key={q.id}
                    meta={
                      <>
                        <span>n. {q.id}</span>
                        <span>{SUBJ[q.s].s}</span>
                        {!e ? (
                          <span className="font-semibold text-blu">mai vista</span>
                        ) : e[0] >= 3 ? (
                          <span className="font-semibold text-ok">consolidata</span>
                        ) : (
                          <span className="font-semibold text-amb">livello {e[0]}</span>
                        )}
                        {e && e[3] > 0 && (
                          <span className="font-semibold text-ko">
                            {e[3]} {e[3] === 1 ? "errore" : "errori"}
                          </span>
                        )}
                        {copie.length > 0 && <span>identica ai n. {copie.join(", ")}</span>}
                        {tw.length > 0 && <span>simile ai n. {tw.join(", ")}</span>}
                      </>
                    }
                    domanda={<Hl s={q.q} cerca={cercaLenta} />}
                    risposta={<Hl s={q.ok} cerca={cercaLenta} />}
                    nascosta={nascondi && !scoperte.has(q.id)}
                    onScopri={() => setScoperte((s) => new Set(s).add(q.id))}
                  />
                );
              })}
            </ol>
            {f.length > mostrate && (
              <Button className="mt-2" onClick={() => setMostrate((n) => n + PAGINA)}>
                Mostra altre {Math.min(PAGINA, f.length - mostrate)}
              </Button>
            )}
          </>
        )}
      </Foglio>
    </div>
  );
}
