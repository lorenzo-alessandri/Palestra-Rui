import type { ReactNode } from "react";
import { cx } from "./cx";

/* Un «foglio»: superficie bianca con filetto, come un modulo stampato. */
export function Foglio({
  title,
  aside,
  children,
  className,
}: {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("min-w-0 rounded-foglio border border-riga bg-foglio p-4 sm:p-5", className)}>
      {title && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="m-0 text-[17px] font-semibold">{title}</h2>
          {aside && <div className="tnum text-[13px] text-mut">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
