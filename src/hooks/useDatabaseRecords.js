import { useEffect, useState } from 'react';
import { fetchDatabaseRecords, updateDatabaseRecord } from '../services/databaseRecordsService';
import { showSuccess, showError } from '../services/toastService';

export function useDatabaseRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchDatabaseRecords()
      .then(res => setRecords(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const updateRecord = async (id, value) => {
    setLoading(true);
    try {
      const res = await updateDatabaseRecord(id, value);
      if (res.success) {
        showSuccess(res.message || 'Record updated successfully');
      } else {
        showError(res.message || 'Failed to update record');
      }
      // Refresh records after update
      const refreshed = await fetchDatabaseRecords();
      setRecords(refreshed.data);
      return res;
    } catch (err) {
      setError(err);
      showError(err.message || 'Error updating record');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { records, loading, error, updateRecord };
}
