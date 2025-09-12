import { useState, useEffect, useRef } from 'react';
import { fetchLatestSingleAcquisition } from '../services/latestSingleAcquisitionService';

export const useLatestSingleAcquisitionRealtime = (codLinea, codPostazione, pollingInterval = 5000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchLatestData = async () => {
    if (!codLinea || !codPostazione) {
      setData(null);
      setError(null);
      setIsPolling(false);
      return;
    }

    try {
      console.log('Fetching latest data for:', codLinea, codPostazione);
      setLoading(true);
      setError(null);
      
      const result = await fetchLatestSingleAcquisition(codLinea, codPostazione);
      console.log('Hook received result:', result);
      
      if (mountedRef.current) {
        if (result.success) {
          console.log('Latest acquisition data received:', result.data);
          setData(result.data);
          setLastUpdate(new Date());
        } else {
          console.log('API returned success=false:', result.message);
          setError(result.message);
          setData(null);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        setData(null);
        console.error('Error fetching latest acquisition:', err);
      }
    } finally {
      if (mountedRef.current) {
        console.log('Setting loading to false');
        setLoading(false);
      }
    }
  };

  const startPolling = () => {
    if (!codLinea || !codPostazione) return;
    
    setIsPolling(true);
    
    // Initial fetch
    fetchLatestData();
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start polling
    intervalRef.current = setInterval(fetchLatestData, pollingInterval);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start/stop polling when dependencies change
  useEffect(() => {
    if (codLinea && codPostazione) {
      startPolling();
    } else {
      stopPolling();
      setData(null);
      setError(null);
    }

    return () => {
      stopPolling();
    };
  }, [codLinea, codPostazione, pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdate,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchLatestData
  };
};