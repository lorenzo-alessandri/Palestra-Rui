import { QI, TW } from "../core/data";

/* Dopo la risposta: le domande quasi uguali nel database, con la loro risposta esatta. */
export function Gemelle({ id }: { id: number }) {
  const t = TW(id).slice(0, 3);
  if (!t.length) return null;
  return (
    <aside className="rounded-tasto bg-amb-soft px-4 py-3.5">
      <h3 className="m-0 text-[13px] font-semibold text-amb">Domande simili nel database: occhio alle differenze</h3>
      <ul className="m-0 mt-2.5 flex list-none flex-col gap-3 p-0">
        {t.map((x) => {
          const z = QI.get(x)!;
          return (
            <li key={x} className="font-read text-[15px] leading-[1.5]">
              <span className="tnum mr-1.5 font-sans text-[13px] text-mut">n. {z.id}</span>
              {z.q}
              <div className="mt-0.5 font-semibold text-ok">{z.ok}</div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
