import { normalizeAcquisizioniArray } from './acquisizioniNormalizer';
import { ESITO_STATE, resolveEsitoState } from './esitoDisplay';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5065';

/**
 * Tutte le acquisizioni di un ordine, su qualunque linea e postazione.
 *
 * Il backend (GET /api/Acquisizioni/ordine) restituisce un array piatto con la
 * stessa forma di AcquisizioniFilter, quindi il normalizer vale invariato: il
 * raggruppamento per linea/postazione si fa qui sul client.
 */
export const fetchAcquisizioniByOrdine = async (codiceOrdine) => {
  try {
    const codice = (codiceOrdine ?? '').trim();

    if (!codice) {
      return {
        success: false,
        message: 'Il codice ordine e\' richiesto',
        data: []
      };
    }

    const url = new URL(`${API_BASE_URL}/api/Acquisizioni/ordine`);
    url.searchParams.append('codiceOrdine', codice);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    const data = normalizeAcquisizioniArray(payload);

    return {
      success: payload?.success ?? true,
      message: payload?.message ?? 'Acquisizioni caricate con successo',
      codiceOrdine: payload?.codiceOrdine ?? codice,
      count: payload?.count ?? data.length,
      data
    };
  } catch (error) {
    console.error('Error fetching acquisizioni by ordine:', error);
    return {
      success: false,
      message: error.message || 'Errore nel caricamento delle acquisizioni dell\'ordine',
      data: []
    };
  }
};

// Stessa chiave del BuildComboKey lato backend: "LINEA|POSTAZIONE" upper-invariant.
const buildComboKey = (codLinea, codPostazione) => (
  `${(codLinea ?? '').trim().toUpperCase()}|${(codPostazione ?? '').trim().toUpperCase()}`
);

/**
 * Raggruppa le acquisizioni per combinazione linea/postazione mantenendo
 * l'ordine in cui sono arrivate dal server.
 *
 * @returns {Array<{key: string, codLinea: string, codPostazione: string, items: object[]}>}
 */
export const groupByLineaPostazione = (records) => {
  const groups = new Map();

  (records ?? []).forEach((record) => {
    const codLinea = record?.coD_LINEA ?? '';
    const codPostazione = record?.coD_POSTAZIONE ?? '';
    const key = buildComboKey(codLinea, codPostazione);

    if (!groups.has(key)) {
      groups.set(key, { key, codLinea, codPostazione, items: [] });
    }

    groups.get(key).items.push(record);
  });

  return [...groups.values()];
};

/**
 * Riepilogo dell'ordine. Gli stati OK/KO/non testato vengono da esitoDisplay,
 * unica fonte di verita' per quelle regole.
 *
 * Conta SOLO l'esito ARTICOLO (resolveEsitoState), per scelta: i contatori
 * aggregati (qui e in Home) restano articolo; il colore si vede sul singolo record.
 */
export const summarizeOrdine = (records) => {
  const list = records ?? [];
  const articoli = new Set();
  const linee = new Set();
  let ok = 0;
  let ko = 0;
  let nonTestati = 0;

  list.forEach((record) => {
    if (record?.codicE_ARTICOLO) articoli.add(record.codicE_ARTICOLO);
    if (record?.coD_LINEA) linee.add(record.coD_LINEA);

    switch (resolveEsitoState(record)) {
      case ESITO_STATE.OK:
        ok += 1;
        break;
      case ESITO_STATE.KO:
        ko += 1;
        break;
      default:
        nonTestati += 1;
    }
  });

  return {
    total: list.length,
    ok,
    ko,
    nonTestati,
    articoli: [...articoli],
    linee: [...linee],
  };
};
