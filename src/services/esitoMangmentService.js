const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5065';

const toNumberOrNull = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue === '') {
    return null;
  }

  const parsed = Number(normalizedValue.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const extractSinglePayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data[0] ?? null;
  }

  if (payload?.data && typeof payload.data === 'object') {
    return payload.data;
  }

  if (payload && typeof payload === 'object') {
    return payload;
  }

  return null;
};

export const normalizeEsitoMangmentRecord = (item) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return {
    id: item.id ?? item.ID ?? null,
    rightSideAngleDifferent: toNumberOrNull(item.rightSideAngleDifferent ?? item.righT_SIDE_ANGLE_DIFFERENT ?? item.RIGHT_SIDE_ANGLE_DIFFERENT),
    rightSideMisalignmentDifferent: toNumberOrNull(item.rightSideMisalignmentDifferent ?? item.righT_SIDE_MISALIGNMENT_DIFFERENT ?? item.RIGHT_SIDE_MISALIGNMENT_DIFFERENT),
    leftSideAngleDifferent: toNumberOrNull(item.leftSideAngleDifferent ?? item.lefT_SIDE_ANGLE_DIFFERENT ?? item.LEFT_SIDE_ANGLE_DIFFERENT),
    leftSideMisalignmentDifferent: toNumberOrNull(item.leftSideMisalignmentDifferent ?? item.lefT_SIDE_MISALIGNMENT_DIFFERENT ?? item.LEFT_SIDE_MISALIGNNMENT_DIFFERENT ?? item.LEFT_SIDE_MISALIGNMENT_DIFFERENT),
    dtIns: item.dtIns ?? item.dT_INS ?? item.DT_INS ?? null,
    dtAgg: item.dtAgg ?? item.dT_AGG ?? item.DT_AGG ?? null,
  };
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const fetchEsitoMangmentSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/EsitoMangment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await parseJsonSafe(response);
    const record = normalizeEsitoMangmentRecord(extractSinglePayload(payload));

    if (!record) {
      return {
        success: false,
        data: null,
        message: 'Nessun valore disponibile per Esito Mangment',
      };
    }

    return {
      success: payload?.success ?? true,
      data: record,
      message: payload?.message ?? 'Valori caricati con successo',
    };
  } catch (error) {
    console.error('Error fetching Esito Mangment settings:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Errore nel caricamento di Esito Mangment',
    };
  }
};

const sendUpdateRequest = async (url, payload) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await parseJsonSafe(response);

  if (!response.ok) {
    const message = responsePayload?.message || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  return {
    success: responsePayload?.success ?? true,
    message: responsePayload?.message ?? 'Valori aggiornati con successo',
    data: normalizeEsitoMangmentRecord(extractSinglePayload(responsePayload)) ?? normalizeEsitoMangmentRecord(payload),
  };
};

export const updateEsitoMangmentSettings = async (settings) => {
  const payload = {
    id: settings?.id ?? undefined,
    rightSideAngleDifferent: toNumberOrNull(settings?.rightSideAngleDifferent),
    rightSideMisalignmentDifferent: toNumberOrNull(settings?.rightSideMisalignmentDifferent),
    leftSideAngleDifferent: toNumberOrNull(settings?.leftSideAngleDifferent),
    leftSideMisalignmentDifferent: toNumberOrNull(settings?.leftSideMisalignmentDifferent),
  };

  const urls = [];

  if (payload.id !== undefined && payload.id !== null) {
    urls.push(`${API_BASE_URL}/api/EsitoMangment/${payload.id}`);
  }

  urls.push(`${API_BASE_URL}/api/EsitoMangment`);

  let lastError = null;

  for (const url of urls) {
    try {
      return await sendUpdateRequest(url, payload);
    } catch (error) {
      lastError = error;
    }
  }

  return {
    success: false,
    message: lastError?.message || 'Errore durante l\'aggiornamento dei valori',
    data: null,
  };
};
