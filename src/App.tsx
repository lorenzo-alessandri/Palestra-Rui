import { useCallback, useEffect, useState } from "react";
import { isTab, type Tab } from "./shell/nav";
import { Shell } from "./shell/Shell";
import { Database } from "./views/Database";
import { Errori } from "./views/Errori";
import { Metodo } from "./views/Metodo";
import { Oggi } from "./views/Oggi";
import { StudioFermo, StudioSessione } from "./views/Studio";
import { session, useSession, type Mode } from "./store/session";
import { useSim } from "./store/sim";
import { SimulazioneFerma, SimulazioneInCorso } from "./views/Simulazione";

const fromHash = (): Tab => {
  const h = location.hash.slice(1);
  return isTab(h) ? h : "oggi";
};

export default function App() {
  const [tab, setTab] = useState<Tab>(fromHash);
  useEffect(() => {
    const f = () => setTab(fromHash());
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const go = useCallback((t: Tab) => {
    setTab(t);
    try {
      history.replaceState(null, "", "#" + t);
    } catch {}
    scrollTo(0, 0);
  }, []);

  const { sess } = useSession();
  const { sim } = useSim();
  const start = useCallback(
    (m: Mode) => {
      if (session.startDaily(m)) go("studio");
    },
    [go],
  );

  /* Sessione in corso: a tutto schermo, senza navigazione */
  if (tab === "studio" && sess && sess.cur) return <StudioSessione sess={sess} />;
  if (tab === "simulazione" && sim && !sim.done) return <SimulazioneInCorso sim={sim} />;

  return (
    <Shell tab={tab} go={go}>
      {tab === "oggi" && <Oggi go={go} onStart={start} />}
      {tab === "studio" && <StudioFermo go={go} onStart={start} />}
      {tab === "simulazione" && <SimulazioneFerma go={go} />}
      {tab === "errori" && <Errori go={go} />}
      {tab === "database" && <Database go={go} />}
      {tab === "metodo" && <Metodo />}
    </Shell>
  );
}
