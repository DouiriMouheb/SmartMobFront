const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5065';

const extractSinglePayload = (payload) => {
  if (payload && typeof payload === 'object' && payload.data !== undefined) {
    return payload.data;
  }

  return payload ?? null;
};

const normalizeLatestSingleRecord = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const codiceArticolo = item.codiceArticolo ?? item.codicE_ARTICOLO ?? '';
  const codiceOrdine = item.codiceOrdine ?? item.codicE_ORDINE ?? '';
  const abilitaCq = item.abilitaCq ?? item.abilitA_CQ ?? null;
  const esitoCqArticolo = item.esitoCqArticolo ?? item.esitO_CQ_ARTICOLO ?? null;
  const scostamentoCqArticolo = item.scostamentoCqArticolo ?? item.scostamentO_CQ_ARTICOLO ?? 0;
  const dtIns = item.dtIns ?? item.dT_INS ?? null;

  return {
    ...item,
    codicE_ARTICOLO: codiceArticolo,
    codicE_ORDINE: codiceOrdine,
    abilitA_CQ: abilitaCq,
    esitO_CQ_ARTICOLO: esitoCqArticolo,
    scostamentO_CQ_ARTICOLO: scostamentoCqArticolo,
    dT_INS: dtIns,
  };
};

export const fetchLatestSingleAcquisition = async (codLinea, codPostazione) => {
  console.log('Service function called with:', codLinea, codPostazione);
  try {
    if (!codLinea || !codPostazione) {
      console.log('Missing parameters, returning early');
      return {
        success: false,
        message: 'Linea di produzione e postazione sono richieste',
        data: null
      };
    }

    const url = `${API_BASE_URL}/api/acquisizioni/latest-single/line/${encodeURIComponent(codLinea)}/station/${encodeURIComponent(codPostazione)}`;
    
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status, 'OK:', response.ok);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          message: 'Nessuna acquisizione trovata per questa combinazione',
          data: null
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    const data = normalizeLatestSingleRecord(extractSinglePayload(payload));
    console.log('Response data:', data);
    
    return {
      success: true,
      message: 'Ultima acquisizione caricata con successo',
      data: data
    };
  } catch (error) {
    console.error('Error fetching latest single acquisition:', error);
    return {
      success: false,
      message: error.message || 'Errore nel caricamento dell\'ultima acquisizione',
      data: null
    };
  }
};