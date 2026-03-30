const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5065';

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const normalizeAcquisizioneRecord = (item) => {
  const codiceArticolo = item?.codiceArticolo ?? item?.codicE_ARTICOLO ?? '';
  const codiceOrdine = item?.codiceOrdine ?? item?.codicE_ORDINE ?? '';
  const esitoCqArticolo = item?.esitoCqArticolo ?? item?.esitO_CQ_ARTICOLO ?? null;
  const scostamentoCqArticolo = item?.scostamentoCqArticolo ?? item?.scostamentO_CQ_ARTICOLO ?? 0;
  const dtIns = item?.dtIns ?? item?.dT_INS ?? null;

  return {
    ...item,
    codicE_ARTICOLO: codiceArticolo,
    codicE_ORDINE: codiceOrdine,
    esitO_CQ_ARTICOLO: esitoCqArticolo,
    scostamentO_CQ_ARTICOLO: scostamentoCqArticolo,
    dT_INS: dtIns,
  };
};

export const fetchAcquisizioniByFilter = async (codLineaProd, codPostazione) => {
  try {
    if (!codLineaProd || !codPostazione) {
      return {
        success: false,
        message: 'Linea di produzione e postazione sono richieste',
        data: []
      };
    }

    const url = new URL(`${API_BASE_URL}/api/AcquisizioniFilter`);
    url.searchParams.append('codLineaProd', codLineaProd);
    url.searchParams.append('codPostazione', codPostazione);

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
    const data = extractArrayPayload(payload).map(normalizeAcquisizioneRecord);
    
    return {
      success: true,
      message: 'Acquisizioni caricate con successo',
      data
    };
  } catch (error) {
    console.error('Error fetching acquisizioni:', error);
    return {
      success: false,
      message: error.message || 'Errore nel caricamento delle acquisizioni',
      data: []
    };
  }
};
