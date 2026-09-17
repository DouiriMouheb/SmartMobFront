import { useCallback, useState } from 'react';
import { fetchAcquisizioniByOrdine } from '../services/controlloOrdineService';

/**
 * Ricerca di un ordine, avviata dall'utente (submit) e non da un effect:
 * a differenza di useAcquisizioniFilter qui non si carica nulla al mount
 * ne' a ogni tasto premuto.
 *
 * hasSearched distingue "non ho ancora cercato" da "ordine non trovato".
 */
export const useControlloOrdine = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedCode, setSearchedCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setSearchedCode('');
    setHasSearched(false);
  }, []);

  const search = useCallback(async (codiceOrdine) => {
    const codice = (codiceOrdine ?? '').trim();

    if (!codice) {
      return;
    }

    setLoading(true);
    setError(null);
    setSearchedCode(codice);

    try {
      const result = await fetchAcquisizioniByOrdine(codice);

      if (result.success) {
        setData(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message);
      setData([]);
      console.error('Error loading acquisizioni by ordine:', err);
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    searchedCode,
    hasSearched,
    search,
    reset,
  };
};
