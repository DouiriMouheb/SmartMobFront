
import { showSuccess, showError } from './toastService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export const fetchDispositiviMultimedialiRecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/DispositiviMultimediali`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Read the response body as text first
        const responseText = await response.text();
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.title || responseText || errorMessage;
        } catch (jsonError) {
          // If it's not JSON, use the text directly
          errorMessage = responseText || errorMessage;
        }
      } catch (readError) {
        // Keep the default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      message: 'Records retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching dispositivi multimediali records:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch records',
      error: error.message
    };
  }
};

export const createDispositiviMultimedialiRecord = async (recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/DispositiviMultimediali`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Read the response body as text first
        const responseText = await response.text();
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.title || responseText || errorMessage;
        } catch (jsonError) {
          // If it's not JSON, use the text directly
          errorMessage = responseText || errorMessage;
        }
      } catch (readError) {
        // Keep the default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      message: 'Dispositivo multimediale creato con successo'
    };
  } catch (error) {
    console.error('Error creating dispositivo multimediale record:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Errore nella creazione del dispositivo multimediale',
      error: error.message
    };
  }
};

export const updateDispositiviMultimedialiRecord = async (id, recordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/DispositiviMultimediali/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Read the response body as text first
        const responseText = await response.text();
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.title || responseText || errorMessage;
        } catch (jsonError) {
          // If it's not JSON, use the text directly
          errorMessage = responseText || errorMessage;
        }
      } catch (readError) {
        // Keep the default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      message: 'Dispositivo multimediale aggiornato con successo'
    };
  } catch (error) {
    console.error('Error updating dispositivo multimediale record:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Errore nell\'aggiornamento del dispositivo multimediale',
      error: error.message
    };
  }
};

export const deleteDispositiviMultimedialiRecord = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/DispositiviMultimediali/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Read the response body as text first
        const responseText = await response.text();
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.title || responseText || errorMessage;
        } catch (jsonError) {
          // If it's not JSON, use the text directly
          errorMessage = responseText || errorMessage;
        }
      } catch (readError) {
        // Keep the default error message
      }
      throw new Error(errorMessage);
    }
    
    return {
      success: true,
      data: null,
      message: 'Dispositivo multimediale eliminato con successo'
    };
  } catch (error) {
    console.error('Error deleting dispositivo multimediale record:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Errore nell\'eliminazione del dispositivo multimediale',
      error: error.message
    };
  }
};
