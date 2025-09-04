import { useEffect, useState } from 'react';
import { fetchDatabaseRecords, updateDatabaseRecord } from '../services/databaseRecordsService';
import { showSuccess, showError } from '../services/toastService';

export function useDatabaseRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetchDatabaseRecords();
      setRecords(res.data);
      setError(null);
    } catch (err) {
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
      const res = await updateDatabaseRecord(id, value);
      if (res.success) {
        showSuccess(res.message || 'Record aggiornato con successo');
      } else {
        showError(res.message || 'Aggiornamento del record fallito');
      }
      // Refresh records after update
      await fetchRecords();
      return res;
    } catch (err) {
      setError(err);
      showError(err.message || 'Errore nell\'aggiornamento del record');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const refreshRecords = fetchRecords;

  return { records, loading, error, updateRecord, refreshRecords };
}
