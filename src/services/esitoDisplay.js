/**
 * Unica fonte di verità per la visualizzazione dell'esito CQ.
 *
 * Ci sono DUE dimensioni di controllo qualità per acquisizione, con la stessa regola:
 *   - ARTICOLO: abilitA_CQ          + esitO_CQ_ARTICOLO (+ scostamentO_CQ_ARTICOLO)
 *   - COLORE:   abilitA_CQ_COLORE   + esitO_CQ_COLORE   (+ scostamentO_CQ_COLORE)
 *
 * Regole (in quest'ordine, per ciascuna dimensione):
 *   1. abilita = 0 / null       -> NON TESTATO (grigio, trattino)
 *   2. abilita = 1              -> si guarda l'esito:
 *        - null / undefined    -> NON TESTATO (grigio, trattino)
 *        - 1 (true)            -> OK  (verde)
 *        - 0 (false)           -> KO  (rosso)
 *
 * Nota: ABILITA_CQ e' BIT NOT NULL lato DB (bool in C#), mentre ABILITA_CQ_COLORE
 * e' BIT NULL (bool?): un record mai valutato sul colore arriva con tutto null e
 * ricade in NON TESTATO senza casi speciali.
 *
 * Ogni pagina mappa poi lo stato sui propri colori/etichette: qui non si
 * decide lo stile, solo lo stato logico (e il nome della dimensione).
 *
 * `resolveEsitoState` resta la funzione "storica" e vale per l'ARTICOLO: e' quella
 * usata dalle statistiche aggregate (Home, riepilogo Controllo Ordine), che per
 * scelta restano solo articolo.
 */

export const ESITO_STATE = {
  NON_TESTATO: 'non-testato',
  OK: 'ok',
  KO: 'ko',
};

// Regola unica per entrambe le dimensioni. `abilita` puo' essere null (colore).
const resolveState = (abilita, esito) => {
  // 1) CQ non abilitato (o mai valorizzato) => non c'e' nessun esito da mostrare
  if (!abilita) {
    return ESITO_STATE.NON_TESTATO;
  }

  // 2) CQ abilitato ma esito non ancora registrato
  if (esito === null || esito === undefined || esito === '') {
    return ESITO_STATE.NON_TESTATO;
  }

  // 3) esito 1 => OK, esito 0 => KO
  return esito ? ESITO_STATE.OK : ESITO_STATE.KO;
};

// Accettano sia record normalizzati (abilitA_CQ...) sia payload grezzi (abilitaCq...).
const readAbilitaCq = (record) => record?.abilitA_CQ ?? record?.abilitaCq ?? null;
const readEsitoCq = (record) => record?.esitO_CQ_ARTICOLO ?? record?.esitoCqArticolo ?? null;
const readScostamentoCq = (record) => record?.scostamentO_CQ_ARTICOLO ?? record?.scostamentoCqArticolo ?? null;

const readAbilitaCqColore = (record) => record?.abilitA_CQ_COLORE ?? record?.abilitaCqColore ?? null;
const readEsitoCqColore = (record) => record?.esitO_CQ_COLORE ?? record?.esitoCqColore ?? null;
const readScostamentoCqColore = (record) => record?.scostamentO_CQ_COLORE ?? record?.scostamentoCqColore ?? null;

/**
 * Esito CQ ARTICOLO.
 * @param {object} record acquisizione (normalizzata o grezza)
 * @returns {'non-testato'|'ok'|'ko'}
 */
export const resolveEsitoState = (record) => resolveState(readAbilitaCq(record), readEsitoCq(record));

/**
 * Esito CQ COLORE.
 * @param {object} record acquisizione (normalizzata o grezza)
 * @returns {'non-testato'|'ok'|'ko'}
 */
export const resolveEsitoColoreState = (record) => resolveState(readAbilitaCqColore(record), readEsitoCqColore(record));

export const isEsitoOk = (record) => resolveEsitoState(record) === ESITO_STATE.OK;

export const isEsitoKo = (record) => resolveEsitoState(record) === ESITO_STATE.KO;

export const isEsitoNonTestato = (record) => resolveEsitoState(record) === ESITO_STATE.NON_TESTATO;

/**
 * Le due dimensioni CQ mostrate a livello di singolo record, nell'ordine di visualizzazione.
 * Le pagine iterano su questo array invece di duplicare la coppia articolo/colore.
 *
 * @type {Array<{
 *   key: 'articolo'|'colore',
 *   label: string,
 *   shortLabel: string,
 *   abilitaLabel: string,
 *   scostamentoLabel: string,
 *   resolve: (record: object) => 'non-testato'|'ok'|'ko',
 *   readAbilita: (record: object) => boolean|null,
 *   readScostamento: (record: object) => number|null,
 * }>}
 */
export const ESITO_DIMENSIONI = [
  {
    key: 'articolo',
    label: 'Esito CQ Articolo',
    shortLabel: 'Articolo',
    abilitaLabel: 'Abilita CQ Articolo',
    scostamentoLabel: 'Scostamento CQ Articolo',
    resolve: resolveEsitoState,
    readAbilita: readAbilitaCq,
    readScostamento: readScostamentoCq,
  },
  {
    key: 'colore',
    label: 'Esito CQ Colore',
    shortLabel: 'Colore',
    abilitaLabel: 'Abilita CQ Colore',
    scostamentoLabel: 'Scostamento CQ Colore',
    resolve: resolveEsitoColoreState,
    readAbilita: readAbilitaCqColore,
    readScostamento: readScostamentoCqColore,
  },
];
