const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const toApiDateTime = (value) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  throw new Error('Intervallo date non valido');
};

export const fetchAcquisizioniStats = async (startDate, endDate) => {
  const url = new URL(`${API_BASE_URL}/api/Acquisizioni/stats`, window.location.origin);
  url.searchParams.append('startDate', toApiDateTime(startDate));
  url.searchParams.append('endDate', toApiDateTime(endDate));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP: ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.success === false) {
    throw new Error(payload?.message || 'Impossibile caricare le statistiche');
  }

  return payload;
};
