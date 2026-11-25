/* Esporta e importa i progressi come file .json (stesso formato del prototipo). */
import { blank, mergeInto, seenCount, type State } from "./leitner";

export const exportName = () => "palestra-rui-progressi-" + new Date().toISOString().slice(0, 10) + ".json";

export function parseImport(txt: string): { ok: true; data: Partial<State> } | { ok: false; msg: string } {
  let o: unknown;
  try {
    o = JSON.parse(txt);
  } catch {
    return { ok: false, msg: "Il file non è un'esportazione valida di Palestra RUI." };
  }
  if (!o || typeof o !== "object" || typeof (o as State).p !== "object" || (o as State).p === null)
    return { ok: false, msg: "Il file non contiene progressi di Palestra RUI." };
  return { ok: true, data: o as Partial<State> };
}

/* Unisce i progressi importati a quelli presenti: per ogni domanda vince la storia più lunga */
export function importInto(base: State | null, data: Partial<State>): { S: State; prima: number } {
  const S = base ?? blank();
  const prima = seenCount(S);
  mergeInto(S, data);
  return { S, prima };
}
