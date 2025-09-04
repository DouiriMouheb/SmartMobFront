import { useEffect, useState } from 'react';
import { fetchControlloQualitaRecords, updateControlloQualitaRecord } from '../services/controlloQualitaService';
import { showSuccess, showError } from '../services/toastService';

export function useControlloQualitaRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetchControlloQualitaRecords();
      if (res.success && res.data) {
        setRecords(res.data);
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
