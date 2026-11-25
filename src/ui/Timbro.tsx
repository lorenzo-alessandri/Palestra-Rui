import { cx } from "./cx";

/* Il timbro dell'esito, come su una scheda corretta a mano. */
export function Timbro({ idoneo, vivo }: { idoneo: boolean; vivo?: boolean }) {
  return (
    <span
      className={cx(
        "timbro inline-block rounded-[6px] border-[2.5px] px-3.5 py-1 text-[21px] font-semibold leading-tight tracking-[0.03em]",
        idoneo ? "border-ok text-ok" : "border-ko text-ko",
        vivo && "timbro-vivo",
      )}
    >
      {idoneo ? "Idoneo" : "Non idoneo"}
    </span>
  );
}
