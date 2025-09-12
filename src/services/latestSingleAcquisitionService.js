const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052';

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

    const data = await response.json();
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