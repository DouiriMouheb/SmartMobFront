import { useState, useEffect } from 'react';
import { fetchLineePostazioni } from '../services/lineePostazioniService';

const splitPostazioni = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item ?? '').split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeLineePostazioni = (payload) => {
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  const grouped = new Map();

  rawItems.forEach((item) => {
    const codLineaProd = item?.codLineaProd ?? item?.coD_LINEA_PROD ?? item?.COD_LINEA_PROD;
    const codPostazioneRaw = item?.codPostazione ?? item?.coD_POSTAZIONE ?? item?.COD_POSTAZIONE;

    if (!codLineaProd) {
      return;
    }

    const current = grouped.get(codLineaProd) || new Set();
    splitPostazioni(codPostazioneRaw).forEach((postazione) => current.add(postazione));
    grouped.set(codLineaProd, current);
  });

  return Array.from(grouped.entries()).map(([codLineaProd, postazioni]) => ({
    codLineaProd,
    codPostazioni: Array.from(postazioni)
  }));
};

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
        setData(normalizeLineePostazioni(result.data));
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
      value: item.codLineaProd,
      label: item.codLineaProd
    }));
  };

  // Helper function to get postazioni for a specific linea
  const getPostazioniForLinea = (selectedLinea) => {
    const lineaData = data.find(item => item.codLineaProd === selectedLinea);
    if (!lineaData || !Array.isArray(lineaData.codPostazioni)) return [];

    return lineaData.codPostazioni.map(postazione => ({
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
