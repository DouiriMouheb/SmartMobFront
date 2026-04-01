import { normalizeAcquisizioniArray } from './acquisizioniNormalizer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5065';

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
    const data = normalizeAcquisizioniArray(payload);
    
    return {
      success: payload?.success ?? true,
      message: payload?.message ?? 'Acquisizioni caricate con successo',
      page: payload?.page,
      pageSize: payload?.pageSize,
      total: payload?.total ?? data.length,
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
