import { QI, SUBJ } from "../core/data";
import { num, today } from "../core/dates";
import type { Tab } from "../shell/nav";
import { session, shuffle } from "../store/session";
import { useS } from "../store/store";
import { Button } from "../ui/Button";
import { Foglio } from "../ui/Foglio";
import { Quesito } from "../ui/Quesito";

export function Errori({ go }: { go: (t: Tab) => void }) {
  const S = useS();
  const t = today();
  /* Dalle più ostinate: più sbagliate che giuste, poi più errori, poi livello più basso */
  const list = Object.entries(S.p)
    .filter(([, e]) => e[3] > 0)
    .map(([id, e]) => ({ id: +id, e }))
    .sort((a, b) => b.e[3] - b.e[2] - (a.e[3] - a.e[2]) || b.e[3] - a.e[3] || a.e[0] - b.e[0]);
  const weak = list.filter((x) => x.e[0] <= 2);
  const oggi = list.filter((x) => x.e[0] === 1 && x.e[1] === t + 1).map((x) => x.id);
  const allena = (ids: number[], label: string) => {
    if (session.startDrill(ids, label)) go("studio");
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Errori</h1>
      {!list.length ? (
        <Foglio>
          <p className="m-0 max-w-[68ch] text-mut">Ancora nessun errore registrato. Le domande che sbagli finiscono qui, ordinate dalle più ostinate.</p>
          <Button className="mt-4" onClick={() => go("oggi")}>
            Vai a studiare
          </Button>
        </Foglio>
      ) : (
        <>
          <Foglio>
            <dl className="m-0 grid grid-cols-3 gap-2.5">
              {[
                [num(list.length), "sbagliate almeno una volta", "text-ink"],
                [num(weak.length), "ancora deboli (livello 1 o 2)", "text-ko"],
                [num(oggi.length), "sbagliate oggi", "text-ink"],
              ].map(([v, l, c]) => (
                <div key={l} className="rounded-tasto border border-riga px-3.5 py-3">
                  <dd className={`tnum m-0 text-[28px] font-semibold leading-none ${c}`}>{v}</dd>
                  <dt className="mt-1.5 text-[13px] leading-snug text-mut">{l}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button variant="primary" disabled={!weak.length} onClick={() => allena(shuffle(weak.map((x) => x.id)), "Errori deboli")}>
                Allena le deboli ({num(weak.length)})
              </Button>
              <Button disabled={!oggi.length} onClick={() => allena(shuffle(oggi), "Errori di oggi")}>
                Solo quelle di oggi
              </Button>
              <Button onClick={() => allena(list.map((x) => x.id), "Tutti gli errori")}>Tutte, dalle peggiori</Button>
            </div>
            <p className="mb-0 mt-3 text-[13px] text-mut">Allenarle qui conta come ripasso: se le azzecchi salgono di livello.</p>
          </Foglio>

          <Foglio title="Le più ostinate" aside={list.length > 40 ? `prime 40 di ${num(list.length)}` : undefined}>
            <ol className="m-0 list-none p-0">
              {list.slice(0, 40).map(({ id, e }) => {
                const q = QI.get(id)!;
                return (
                  <Quesito
                    key={id}
                    meta={
                      <>
                        <span>n. {q.id}</span>
                        <span>{SUBJ[q.s].s}</span>
                        <span className="font-semibold text-ko">
                          {e[3]} {e[3] === 1 ? "sbagliata" : "sbagliate"}
                        </span>
                        <span className="font-semibold text-ok">
                          {e[2]} {e[2] === 1 ? "giusta" : "giuste"}
                        </span>
                      </>
                    }
                    domanda={q.q}
                    risposta={q.ok}
                  />
                );
              })}
            </ol>
          </Foglio>
        </>
      )}
    </div>
  );
}
