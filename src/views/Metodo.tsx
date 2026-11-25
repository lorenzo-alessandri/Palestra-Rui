import { useRef, useState, type ReactNode } from "react";
import { Q, SUBJ, UN } from "../core/data";
import { num } from "../core/dates";
import { exportName, importInto, parseImport } from "../core/io";
import { blank, seenCount } from "../core/leitner";
import { NOTRE, NUMRE } from "../core/testo";
import { store, useS } from "../store/store";
import { Button } from "../ui/Button";
import { Foglio } from "../ui/Foglio";
import { TemaSwitch } from "../ui/TemaSwitch";

const Prosa = ({ children }: { children: ReactNode }) => (
  <div className="flex max-w-[68ch] flex-col gap-3 font-read text-[17px] leading-[1.6] [&_li]:pl-1 [&_strong]:font-semibold [&_ul]:m-0 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
    {children}
  </div>
);
const Nota = ({ children }: { children: ReactNode }) => <p className="m-0 max-w-[68ch] font-sans text-[13px] leading-normal text-mut">{children}</p>;
const th = "border-b border-riga py-2 pr-4 text-left text-[13px] font-semibold text-mut";
const td = "border-b border-riga py-2 pr-4";

const N_NUM = Q.filter((q) => NUMRE.test(q.ok)).length;
const N_NON = Q.filter((q) => NOTRE.test(q.q)).length;

export function Metodo() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Metodo</h1>

      <Foglio title="Come funziona la prova">
        <Prosa>
          <p className="m-0">
            Prova scritta di idoneità IVASS, modulo assicurativo: <strong>50 quesiti in 75 minuti</strong>, tre opzioni ciascuno, una sola esatta. Ogni risposta
            giusta vale +1, ogni sbagliata −0,5, ogni bianca 0. Sei idoneo con <strong>60/100, cioè 30 punti su 50</strong>.
          </p>
          <p className="m-0">
            I quesiti sono estratti dal database ufficiale di 2.292 domande. Togliendo le due materie riassicurative restano{" "}
            <strong>{num(Q.length)} domande</strong>: sono tutte qui dentro, e sono le uniche che ti possono capitare.
          </p>
          <p className="m-0">
            <strong>Doppioni.</strong> Nel database 282 di queste domande sono ripetute in modo identico (stessa domanda, stessa risposta esatta) in 131 gruppi.
            La palestra le tratta come una sola carta: le domande diverse da studiare sono <strong>{num(UN)}</strong>. Quando rispondi a una, conta per tutte
            le sue copie; le copie però possono avere risposte sbagliate diverse, e la palestra te le mostra a turno.
          </p>
          <p className="m-0">
            <strong>Gemelle.</strong> Altre 358 domande hanno una gemella quasi uguale che cambia una parola (ramo V e ramo VI, nullità e annullamento, con o
            senza controassicurazione): dopo la risposta la trovi subito sotto.
          </p>
          <Nota>
            Fonte dei quesiti: IVASS, «Database dei quesiti per le prove RUI», dicembre 2025, predisposto con i Dipartimenti di Scienze giuridiche e di Scienze
            per l'economia e l'impresa dell'Università di Firenze. Riproduzione consentita a fini didattici e non commerciali con citazione della fonte.
          </Nota>
          <Nota>Formato della prova e database possono cambiare da un'edizione all'altra: controlla sempre il bando della tua sessione sul sito IVASS.</Nota>
        </Prosa>
      </Foglio>

      <Foglio title="Le tre fasi">
        <ol className="m-0 grid list-none gap-2.5 p-0 md:grid-cols-3">
          {[
            ["Prima passata", "fino a 25 giorni dall'esame", "Le domande nuove, senza limite giornaliero, mescolate tra le materie in proporzione al peso, più i ripassi che scadono. Si chiude con tutte le domande viste almeno una volta. Circa 60–75 minuti al giorno."],
            ["Consolidamento", "da 24 a 5 giorni dall'esame", "Niente domande nuove. Ripassi in scadenza, Errori ogni giorno, una simulazione completa a giorni alterni. Obiettivo: stare sopra 70/100 in simulazione."],
            ["Rifinitura", "ultimi 4 giorni", "Una simulazione al giorno, poi solo errori deboli e il filtro «Numeri, termini e percentuali». Il giorno prima dell'esame solo un ripasso leggero."],
          ].map(([n, d, p], i) => (
            <li key={n} className="rounded-tasto border border-riga p-4">
              <p className="tnum m-0 text-[13px] font-semibold text-blu">
                {i + 1}. {d}
              </p>
              <h3 className="m-0 mt-1 text-[17px] font-semibold">{n}</h3>
              <p className="m-0 mt-2 text-[15px] text-mut">{p}</p>
            </li>
          ))}
        </ol>
        <p className="mb-0 mt-3 max-w-[68ch] text-[13px] text-mut">
          Se imposti la data d'esame nella schermata Oggi, la palestra ti dice in che fase sei e quando conviene fare una simulazione. Senza data funziona
          tutto lo stesso.
        </p>
      </Foglio>

      <Foglio title="La giornata tipo">
        <Prosa>
          <ul>
            <li>
              <strong>Apri Oggi</strong> e scegli: Ripassi (solo le domande già viste in scadenza, dalle più vecchie), Nuove (solo quelle mai viste) o Miste
              (le due insieme). Ti conviene partire dai ripassi. Quando esce una nuova che ha una gemella, la gemella arriva subito dopo. Puoi uscire e
              riprendere quando vuoi.
            </li>
            <li>
              <strong>Rispondi davvero</strong> prima di guardare. Se non ne hai idea premi «Non lo so» invece di tirare a caso: così la domanda torna presto e
              non ti illudi.
            </li>
            <li>
              <strong>Chiudi con 10 minuti su Errori, «Solo quelle di oggi».</strong> Rileggere subito la risposta giusta è il momento in cui si fissa.
            </li>
          </ul>
        </Prosa>
      </Foglio>

      <Foglio title="Come funziona il ripasso">
        <Prosa>
          <p className="m-0">
            Ogni domanda ha un livello. Se rispondi giusto sale e torna sempre più tardi; se sbagli torna a livello 1: nella stessa sessione te la ripropone
            dopo 5 carte, e poi di nuovo il giorno seguente. Sbagliare una domanda nuova al primo colpo non è un problema: provare a rispondere e vedere
            subito la correzione la fissa meglio che leggere la risposta.
          </p>
        </Prosa>
        <div className="my-4 overflow-x-auto">
          <table className="tnum w-full max-w-[520px] border-collapse text-[15px]">
            <thead>
              <tr>
                <th className={th}>Livello</th>
                <th className={th}>Torna dopo</th>
                <th className={th}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "1 giorno", "sbagliata o appena vista"],
                ["2", "3 giorni", "giusta una volta"],
                ["3", "7 giorni", "consolidata"],
                ["4", "14 giorni", "consolidata"],
                ["5", "30 giorni", "consolidata"],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c) => (
                    <td key={c} className={td}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prosa>
          <p className="m-0">
            Le opzioni vengono mescolate ogni volta. Nel PDF ufficiale la risposta esatta è sempre nella prima colonna, quindi studiando dal PDF si impara la
            posizione, non il contenuto.
          </p>
        </Prosa>
      </Foglio>

      <Foglio title="Strategia in aula">
        <Prosa>
          <p className="m-0">
            Con tre opzioni, tirare a caso vale in media <strong>zero</strong>: 1/3 × 1 − 2/3 × 0,5 = 0. Se ne escludi una con certezza, rispondere vale in
            media <strong>+0,25</strong>. Quindi:
          </p>
          <ul>
            <li>
              <strong>Rispondi</strong> ogni volta che riesci a scartare almeno un'opzione.
            </li>
            <li>
              <strong>Lascia in bianco</strong> solo quando sei completamente al buio.
            </li>
            <li>Combinazioni che bastano: 30 giuste e 0 sbagliate; 34 giuste e 8 sbagliate; 36 giuste e 12 sbagliate. Con 40 giuste e 10 sbagliate fai 70/100.</li>
            <li>75 minuti per 50 domande sono 90 secondi l'una: fai un primo giro rispondendo alle sicure, poi torna sulle dubbie.</li>
          </ul>
        </Prosa>
      </Foglio>

      <Foglio title="Dove si perdono punti">
        <Prosa>
          <ul>
            <li>
              <strong>Numeri e termini</strong> ({num(N_NUM)} domande hanno una cifra nella risposta): giorni per recesso, denuncia del sinistro, prescrizioni,
              percentuali, massimali. Nel Database usa il filtro «Numeri, termini e percentuali».
            </li>
            <li>
              <strong>Domande al negativo</strong> ({num(N_NON)} contengono «NON»): leggi la domanda due volte. C'è un filtro apposta.
            </li>
            <li>
              <strong>Assoluti</strong>: «sempre», «mai», «salvo patto contrario», «esclusivamente». Spesso la risposta giusta è quella con l'eccezione.
            </li>
            <li>
              <strong>Chi fa cosa</strong>: IVASS, Consob, COVIP, MIMIT, CONSAP; e le sezioni del RUI (A agenti, B broker, C produttori diretti, D banche e
              intermediari finanziari, E collaboratori, F intermediari a titolo accessorio). Cercale nel Database.
            </li>
          </ul>
        </Prosa>
      </Foglio>

      <Foglio title="Peso delle materie nel database">
        <div className="overflow-x-auto">
          <table className="tnum w-full border-collapse text-[15px]">
            <thead>
              <tr>
                <th className={th}>Materia</th>
                <th className={th + " text-right"}>Domande</th>
                <th className={th + " text-right"}>Quota</th>
                <th className={th + " pr-0 text-right"}>In simulazione</th>
              </tr>
            </thead>
            <tbody>
              {SUBJ.map((s, i) => {
                const n = Q.filter((q) => q.s === i).length;
                return (
                  <tr key={i}>
                    <td className={td}>{s.n}</td>
                    <td className={td + " text-right"}>{num(n)}</td>
                    <td className={td + " text-right"}>{((n / Q.length) * 100).toFixed(1).replace(".", ",")}%</td>
                    <td className={td + " pr-0 text-right"}>{s.k}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mb-0 mt-3 max-w-[68ch] text-[13px] text-mut">
          Diritto delle assicurazioni e distribuzione valgono insieme oltre il 60% del database. IVASS non pubblica la ripartizione per materia; nella prova
          di giugno 2025 è stata: 16 diritto delle assicurazioni, 17 distribuzione, 10 tecnica, 4 diritto privato, 1 a testa per tributario, previdenza e
          consumatore.
        </p>
      </Foglio>

      <Foglio title="Aspetto">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <TemaSwitch />
          <span className="text-[13px] text-mut">Automatico segue il tema del dispositivo.</span>
        </div>
      </Foglio>

      <Dati />
    </div>
  );
}

/* Dati salvati: esporta, importa, azzera */
function Dati() {
  const S = useS();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [testo, setTesto] = useState("");
  const [conferma, setConferma] = useState(false);

  const esporta = () => {
    const txt = JSON.stringify(store.get());
    const name = exportName();
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([txt], { type: "application/json" }));
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTesto("");
      setMsg(`File scaricato: ${name}. Se il download non parte, usa «Copia come testo».`);
    } catch {
      copia();
    }
  };
  const copia = async () => {
    const txt = JSON.stringify(store.get());
    setTesto(txt);
    try {
      await navigator.clipboard.writeText(txt);
      setMsg("Progressi copiati negli appunti: incollali in un file .json.");
    } catch {
      setMsg("Copia questo testo e salvalo in un file .json.");
    }
  };
  const importa = (txt: string) => {
    const r = parseImport(txt);
    if (!r.ok) return setMsg(r.msg);
    const { S: nuovo, prima } = importInto(store.isDemo() ? null : store.get(), r.data);
    store.replace({ ...nuovo, t: Date.now() });
    setTesto("");
    setMsg(`Importazione fatta: ${num(seenCount(nuovo))} domande viste (prima ${num(prima)}), ${nuovo.sims.length} simulazioni.`);
  };

  return (
    <Foglio title="Dati salvati">
      <p className="m-0 max-w-[68ch] text-[15px] text-mut">
        I progressi restano nel browser di questo dispositivo: apri sempre la palestra con lo stesso browser. Per portarli su un altro dispositivo, o per
        tenerne una copia, esporta da una parte e importa dall'altra. L'importazione unisce i dati e per ogni domanda tiene la storia più lunga.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button variant="primary" onClick={esporta}>
          Esporta progressi
        </Button>
        <Button onClick={() => file.current?.click()}>Importa progressi</Button>
        <Button variant="ghost" onClick={copia}>
          Copia come testo
        </Button>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => importa(String(r.result));
            r.readAsText(f);
            e.target.value = "";
          }}
        />
      </div>
      {msg && (
        <p role="status" className="mb-0 mt-3 text-[13px] text-mut">
          {msg}
        </p>
      )}
      {testo && (
        <textarea
          readOnly
          value={testo}
          aria-label="Progressi in formato testo"
          onFocus={(e) => e.target.select()}
          className="mt-3 h-28 w-full rounded-tasto border border-riga bg-carta p-2.5 font-mono text-[12px] text-ink"
        />
      )}

      <div className="mt-5 border-t border-riga pt-4">
        {conferma ? (
          <div role="alertdialog" aria-label="Conferma azzeramento" className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-tasto bg-amb-soft px-4 py-3 text-amb">
            <span className="font-semibold">Cancelli livelli, errori e simulazioni. Non si torna indietro.</span>
            <span className="flex gap-2">
              <Button
                variant="danger"
                small
                onClick={() => {
                  store.replace({ ...blank(), cfg: S.cfg, t: Date.now() });
                  setConferma(false);
                  setTesto("");
                  setMsg("Progressi azzerati.");
                }}
              >
                Sì, azzera
              </Button>
              <Button small onClick={() => setConferma(false)}>
                Annulla
              </Button>
            </span>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConferma(true)}>
            Azzera tutti i progressi
          </Button>
        )}
      </div>
    </Foglio>
  );
}
