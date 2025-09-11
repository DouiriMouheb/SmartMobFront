const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export const fetchControlloQualitaRecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ControlloQualita`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // API endpoint not ready yet, return empty data
        return { success: true, data: [] };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    // Don't log 404 errors as they're expected when API is not ready
    if (!error.message.includes('404')) {
      console.error('Error fetching controllo qualità records:', error);
    }
    return { success: true, data: [] }; // Return empty data instead of error
  }
};

export const updateControlloQualitaRecord = async (id, updatedRecord) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ControlloQualita/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRecord),
    });

    const data = await response.json();

    if (!response.ok) {
      // If API returned JSON error response, use its message
      return { success: false, message: data.message || `HTTP error! status: ${response.status}` };
    }

    return { success: true, data, message: 'Record aggiornato con successo' };
  } catch (error) {
    console.error('Error updating controllo qualità record:', error);
    return { success: false, message: error.message };
  }
};

export const createControlloQualitaRecord = async (newRecord) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ControlloQualita`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecord),
    });

    const data = await response.json();

    if (!response.ok) {
      // If API returned JSON error response, use its message
      return { success: false, message: data.message || `HTTP error! status: ${response.status}` };
    }

    return { success: true, data, message: 'Record creato con successo' };
  } catch (error) {
    console.error('Error creating controllo qualità record:', error);
    return { success: false, message: error.message };
  }
};

export const deleteControlloQualitaRecord = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ControlloQualita/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true, message: 'Record eliminato con successo' };
  } catch (error) {
    console.error('Error deleting controllo qualità record:', error);
    return { success: false, message: error.message };
  }
};
