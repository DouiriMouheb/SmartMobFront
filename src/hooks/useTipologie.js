import { useEffect, useState } from 'react';
import { fetchTipologie } from '../services/tipologieService';

export function useTipologie() {
  const [tipologie, setTipologie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchTipologie()
      .then(res => setTipologie(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { tipologie, loading, error };
}
