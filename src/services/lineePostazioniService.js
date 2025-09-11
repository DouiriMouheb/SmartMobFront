const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052';

export const fetchLineePostazioni = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/V_AG_LINEE_POSTAZIONI`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      message: 'Linee e postazioni retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching linee e postazioni:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch linee e postazioni',
      error: error.message
    };
  }
};
