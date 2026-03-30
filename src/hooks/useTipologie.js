import { useEffect, useState } from 'react';
import { fetchTipologie } from '../services/tipologieService';

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export function useTipologie() {
  const [tipologie, setTipologie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchTipologie()
      .then((res) => setTipologie(extractArrayPayload(res)))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { tipologie, loading, error };
}
