import { useState, useEffect } from 'react';
import { fetchAcquisizioniByFilter } from '../services/acquisizioniFilterService';

export const useAcquisizioniFilter = (codLineaProd, codPostazione) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAcquisizioni = async () => {
    if (!codLineaProd || !codPostazione) {
      setData([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchAcquisizioniByFilter(codLineaProd, codPostazione);
      
      if (result.success) {
        const normalizedData = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.data)
            ? result.data.data
            : [];

        setData(normalizedData);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message);
      setData([]);
      console.error('Error loading acquisizioni:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger API call when both parameters are available
  useEffect(() => {
    loadAcquisizioni();
  }, [codLineaProd, codPostazione]);

  return {
    data,
    loading,
    error,
    refetch: loadAcquisizioni
  };
};
