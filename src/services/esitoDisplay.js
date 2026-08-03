/**
 * Unica fonte di verità per la visualizzazione dell'esito CQ.
 *
 * Regole (in quest'ordine):
 *   1. abilitA_CQ = 0 (false)  -> NON TESTATO (grigio, trattino)
 *   2. abilitA_CQ = 1 (true)   -> si guarda esitO_CQ_ARTICOLO:
 *        - null / undefined    -> NON TESTATO (grigio, trattino)
 *        - 1 (true)            -> OK  (verde)
 *        - 0 (false)           -> KO  (rosso)
 *
 * Nota: ABILITA_CQ e' BIT NOT NULL lato DB (bool in C#), mentre
 * ESITO_CQ_ARTICOLO e' nullable (bool?): un record con abilitaCq = false
 * arriva tipicamente con esitoCqArticolo = null.
 *
 * Ogni pagina mappa poi lo stato sui propri colori/etichette: qui non si
 * decide lo stile, solo lo stato logico.
 */

export const ESITO_STATE = {
  NON_TESTATO: 'non-testato',
  OK: 'ok',
  KO: 'ko',
};

const readAbilitaCq = (record) => record?.abilitA_CQ ?? record?.abilitaCq ?? null;

const readEsitoCq = (record) => record?.esitO_CQ_ARTICOLO ?? record?.esitoCqArticolo ?? null;

/**
 * @param {object} record acquisizione (normalizzata o grezza)
 * @returns {'non-testato'|'ok'|'ko'}
 */
export const resolveEsitoState = (record) => {
  // 1) CQ non abilitato => non c'e' nessun esito da mostrare
  if (!readAbilitaCq(record)) {
    return ESITO_STATE.NON_TESTATO;
  }

  // 2) CQ abilitato ma esito non ancora registrato
  const esito = readEsitoCq(record);
  if (esito === null || esito === undefined || esito === '') {
    return ESITO_STATE.NON_TESTATO;
  }

  // 3) esito 1 => OK, esito 0 => KO
  return esito ? ESITO_STATE.OK : ESITO_STATE.KO;
};

export const isEsitoOk = (record) => resolveEsitoState(record) === ESITO_STATE.OK;

export const isEsitoKo = (record) => resolveEsitoState(record) === ESITO_STATE.KO;

export const isEsitoNonTestato = (record) => resolveEsitoState(record) === ESITO_STATE.NON_TESTATO;
