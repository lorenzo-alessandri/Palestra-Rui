# Palestra RUI

Web app gratuita per allenarsi alla prova di idoneità IVASS per intermediari assicurativi (iscrizione al RUI sez A/B), modulo assicurativo.

![Schermata Oggi](docs/screenshot.png)

**Demo:** https://lorenzo-alessandri.github.io/Palestra-Rui/

## Cosa fa

- **Tutte le 1.758 domande** del database ufficiale IVASS del modulo assicurativo, ridotte a **1.607 schede**: i 131 gruppi di domande identiche presenti nel PDF ufficiale sono stati uniti, così una domanda già vista non torna come "nuova".
- **Domande gemelle**: 358 domande che differiscono per un solo termine chiave (per esempio ramo V e ramo VI) restano separate ma vengono mostrate insieme dopo ogni risposta.
- **Studio con ripetizione dilazionata** (sistema Leitner): i ripassi in scadenza vengono prima delle domande nuove.
- **Simulazione d'esame** da 50 domande con timer e punteggio ufficiale (+1 corretta, 0 non data, −0,5 errata; idoneità a 60/100), con revisione completa e archivio delle prove.
- **Errori, Database e Metodo**: allenamento sugli errori, ricerca nel database con filtri, esportazione e importazione dei progressi.
- Calendario a fasi con data d'esame scelta dall'utente, tema chiaro/scuro, versione mobile.

Al primo accesso l'app mostra progressi di esempio; con "Parti da zero" si inizia il proprio percorso. I progressi restano solo nel browser di chi la usa.

## Come l'ho costruita

Ho usato Palestra RUI per preparare la mia prova IVASS. Il codice è stato scritto con un assistente AI (Claude); il mio lavoro è stato quello di un analista funzionale:

- **Requisiti**: ho definito cosa doveva fare l'app e le regole d'esame da rispettare (50 domande, punteggio ufficiale, soglia di idoneità).
- **Analisi dei dati**: durante lo studio è emerso che domande già viste tornavano come nuove. Il controllo ha mostrato 131 gruppi di domande identiche nel database ufficiale; ho deciso di unirli e di collegare invece, senza unirle, le 358 domande "gemelle". L'estrazione dal PDF IVASS è stata verificata con due programmi di lettura diversi.
- **Decisioni di prodotto**: progressi salvati solo nel browser (nessun account, nessun dato raccolto), data d'esame scelta dall'utente per valere in ogni sessione, uso solo didattico come richiede la licenza IVASS.
- **Test**: ho provato l'app a ogni passaggio e chiesto correzioni, per esempio la sostituzione di una mappa con 1.607 caselle, poco leggibile, con barre di avanzamento per materia.

Tecnologie: React, TypeScript, Tailwind CSS, Vite. Il repository contiene la build pubblicata in un unico file (`index.html`), che si apre senza installare nulla.

## Fonte e licenza

Le domande provengono dal database ufficiale dei quesiti per la prova di idoneità pubblicato dall'IVASS, riprodotto a soli fini didattici e senza scopo di lucro. La pagina ha il tag `noindex`. Il codice dell'applicazione è sotto licenza MIT (vedi `LICENSE`); il contenuto dei quesiti resta dell'IVASS.
