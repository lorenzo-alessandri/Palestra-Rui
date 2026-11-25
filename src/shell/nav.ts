import { BookOpen, CalendarCheck, Library, PencilLine, RotateCcw, Timer } from "lucide-react";

export type Tab = "oggi" | "studio" | "simulazione" | "errori" | "database" | "metodo";
export const TABS: { k: Tab; l: string; I: typeof Timer }[] = [
  { k: "oggi", l: "Oggi", I: CalendarCheck },
  { k: "studio", l: "Studio", I: PencilLine },
  { k: "simulazione", l: "Simulazione", I: Timer },
  { k: "errori", l: "Errori", I: RotateCcw },
  { k: "database", l: "Database", I: Library },
  { k: "metodo", l: "Metodo", I: BookOpen },
];
export const isTab = (s: string): s is Tab => TABS.some((t) => t.k === s);
