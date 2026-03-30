import { useEffect, useState } from 'react';
import { fetchControlloQualitaRecords, updateControlloQualitaRecord } from '../services/controlloQualitaService';
import { showSuccess, showError } from '../services/toastService';

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export function useControlloQualitaRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetchControlloQualitaRecords();
      if (res.success) {
        setRecords(extractArrayPayload(res.data));
        setError(null);
      } else {
        setRecords([]);
        setError('API not available');
      }
    } catch (err) {
      setRecords([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const updateRecord = async (id, value) => {
    setLoading(true);
    try {
      const res = await updateControlloQualitaRecord(id, value);
      if (res.success) {
        showSuccess(res.message || 'Record aggiornato');
        await fetchRecords();
      } else {
        showError(res.message || 'Aggiornamento fallito');
      }
    } catch (err) {
      showError('Aggiornamento fallito');
    } finally {
      setLoading(false);
    }
  };

  const refreshRecords = async () => {
    await fetchRecords();
  };

  return {
    records,
    loading,
    error,
    updateRecord,
    refreshRecords
  };
}
