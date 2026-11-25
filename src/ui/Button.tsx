import type { ButtonHTMLAttributes, Ref } from "react";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
const V: Record<Variant, string> = {
  primary: "bg-blu text-su-blu border-blu hover:brightness-110",
  secondary: "bg-foglio text-ink border-riga hover:border-mut",
  ghost: "bg-transparent text-ink border-transparent hover:bg-blu-soft",
  danger: "bg-foglio text-ko border-ko hover:bg-ko-soft",
};

export function Button({
  variant = "secondary",
  small,
  className,
  ref,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean; ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      {...p}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-tasto border font-semibold transition-colors disabled:opacity-45",
        small ? "min-h-9 px-3 text-[13px]" : "min-h-11 px-4 text-[15px]",
        V[variant],
        className,
      )}
    />
  );
}
