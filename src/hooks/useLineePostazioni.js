import { useState, useEffect } from 'react';
import { fetchLineePostazioni } from '../services/lineePostazioniService';

export const useLineePostazioni = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchLineePostazioni();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading linee postazioni:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper function to get unique linee
  const getLinee = () => {
    return data.map(item => ({
      value: item.coD_LINEA_PROD,
      label: item.coD_LINEA_PROD
    }));
  };

  // Helper function to get postazioni for a specific linea
  const getPostazioniForLinea = (selectedLinea) => {
    const lineaData = data.find(item => item.coD_LINEA_PROD === selectedLinea);
    if (!lineaData || !lineaData.coD_POSTAZIONE) return [];
    
    // Handle the case where postazioni are comma-separated strings
    const allPostazioni = [];
    lineaData.coD_POSTAZIONE.forEach(postazioneString => {
      // Split by comma in case multiple postazioni are in one string
      const postazioni = postazioneString.split(',').map(p => p.trim());
      allPostazioni.push(...postazioni);
    });
    
    // Remove duplicates and convert to dropdown format
    const uniquePostazioni = [...new Set(allPostazioni)];
    return uniquePostazioni.map(postazione => ({
      value: postazione,
      label: postazione
    }));
  };

  return {
    data,
    loading,
    error,
    getLinee,
    getPostazioniForLinea,
    refetch: loadData
  };
};
