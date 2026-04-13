import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAcquisizioniStats } from '../services/acquisizioniStatsService';

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    startDate: formatDateForInput(firstDayOfYear),
    endDate: formatDateForInput(today),
  };
};

const toStartDateTime = (dateValue) => `${dateValue}T00:00:00`;
const toEndDateTime = (dateValue) => `${dateValue}T23:59:59`;

const emptyStats = {
  startDate: null,
  endDate: null,
  combinationsCount: 0,
  overall: {
    total: 0,
    trueCount: 0,
    falseCount: 0,
    nullCount: 0,
    truePercentage: 0,
    falsePercentage: 0,
    nullPercentage: 0,
  },
  combinations: [],
};

export const useAcquisizioniStats = () => {
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setStartDate = useCallback((value) => {
    setDateRange((prev) => ({
      ...prev,
      startDate: value,
    }));
  }, []);

  const setEndDate = useCallback((value) => {
    setDateRange((prev) => ({
      ...prev,
      endDate: value,
    }));
  }, []);

  const loadStats = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      return;
    }

    if (startDate > endDate) {
      setError('La data di inizio non puo essere successiva alla data di fine');
      setStats(emptyStats);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAcquisizioniStats(
        toStartDateTime(startDate),
        toEndDateTime(endDate)
      );

      setStats({
        startDate: payload?.startDate ?? null,
        endDate: payload?.endDate ?? null,
        combinationsCount: payload?.combinationsCount ?? 0,
        overall: {
          total: payload?.overall?.total ?? 0,
          trueCount: payload?.overall?.trueCount ?? 0,
          falseCount: payload?.overall?.falseCount ?? 0,
          nullCount: payload?.overall?.nullCount ?? 0,
          truePercentage: payload?.overall?.truePercentage ?? 0,
          falsePercentage: payload?.overall?.falsePercentage ?? 0,
          nullPercentage: payload?.overall?.nullPercentage ?? 0,
        },
        combinations: Array.isArray(payload?.combinations) ? payload.combinations : [],
      });
    } catch (err) {
      setStats(emptyStats);
      setError(err?.message || 'Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats(dateRange.startDate, dateRange.endDate);
  }, [dateRange.endDate, dateRange.startDate, loadStats]);

  const refetch = useCallback(() => {
    return loadStats(dateRange.startDate, dateRange.endDate);
  }, [dateRange.endDate, dateRange.startDate, loadStats]);

  return useMemo(() => ({
    dateRange,
    setStartDate,
    setEndDate,
    stats,
    loading,
    error,
    refetch,
  }), [dateRange, error, loading, refetch, setEndDate, setStartDate, stats]);
};
