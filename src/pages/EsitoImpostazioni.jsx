import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, Save, SlidersHorizontal } from 'lucide-react';
import {
  fetchEsitoMangmentSettings,
  updateEsitoMangmentSettings,
} from '../services/esitoMangmentService';
import { showError, showSuccess } from '../services/toastService';

const FIELD_CONFIG = [
  {
    key: 'rightSideAngleDifferent',
    fullName: 'Differenza Angolo Lato Destro',
  },
  {
    key: 'rightSideMisalignmentDifferent',
    fullName: 'Differenza Disallineamento Lato Destro',
  },
  {
    key: 'leftSideAngleDifferent',
    fullName: 'Differenza Angolo Lato Sinistro',
  },
  {
    key: 'leftSideMisalignmentDifferent',
    fullName: 'Differenza Disallineamento Lato Sinistro',
  },
];

const TABLE_ROWS = [...FIELD_CONFIG];
const STEP_VALUE = 0.01;

const toInputValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};

const parseDecimalOrNull = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue === '') {
    return null;
  }

  const parsed = Number(normalizedValue.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const normalizeComparableValue = (value) => {
  const parsed = parseDecimalOrNull(value);

  if (Number.isNaN(parsed)) {
    return Number.NaN;
  }

  return parsed;
};

const roundToStep = (value) => Math.round(value * 100) / 100;

const formatStepValue = (value) => roundToStep(value).toFixed(2);

const EsitoImpostazioni = () => {
  const [record, setRecord] = useState(null);
  const [formValues, setFormValues] = useState({
    rightSideAngleDifferent: '',
    rightSideMisalignmentDifferent: '',
    leftSideAngleDifferent: '',
    leftSideMisalignmentDifferent: '',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const syncFormValues = useCallback((nextRecord) => {
    setFormValues({
      rightSideAngleDifferent: toInputValue(nextRecord?.rightSideAngleDifferent),
      rightSideMisalignmentDifferent: toInputValue(nextRecord?.rightSideMisalignmentDifferent),
      leftSideAngleDifferent: toInputValue(nextRecord?.leftSideAngleDifferent),
      leftSideMisalignmentDifferent: toInputValue(nextRecord?.leftSideMisalignmentDifferent),
    });
  }, []);

  const loadSettings = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    const result = await fetchEsitoMangmentSettings();

    if (result.success && result.data) {
      setRecord(result.data);
      syncFormValues(result.data);
    } else {
      setRecord(null);
      setError(result.message || 'Errore nel caricamento delle impostazioni esito');
    }

    if (isManualRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }, [syncFormValues]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const hasChanges = useMemo(() => {
    if (!record) {
      return false;
    }

    return FIELD_CONFIG.some((field) => {
      const currentValue = normalizeComparableValue(record[field.key]);
      const formValue = normalizeComparableValue(formValues[field.key]);

      if (Number.isNaN(currentValue) || Number.isNaN(formValue)) {
        return true;
      }

      return currentValue !== formValue;
    });
  }, [record, formValues]);

  const handleInputChange = (fieldKey, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleStepChange = (fieldKey, direction) => {
    setFormValues((prev) => {
      const parsed = parseDecimalOrNull(prev[fieldKey]);
      const currentValue = Number.isNaN(parsed) || parsed === null ? 0 : parsed;
      const delta = direction === 'up' ? STEP_VALUE : -STEP_VALUE;
      const nextValue = currentValue + delta;

      return {
        ...prev,
        [fieldKey]: formatStepValue(nextValue),
      };
    });
  };

  const handleInputKeyDown = (event, fieldKey) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleStepChange(fieldKey, 'up');
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleStepChange(fieldKey, 'down');
    }
  };

  const handleSave = async () => {
    if (!record) {
      return;
    }

    const payload = { id: record.id };

    for (const field of FIELD_CONFIG) {
      const parsed = parseDecimalOrNull(formValues[field.key]);

      if (Number.isNaN(parsed)) {
        showError(`Il campo ${field.fullName} deve contenere un numero valido`);
        return;
      }

      payload[field.key] = parsed;
    }

    setSaving(true);
    const result = await updateEsitoMangmentSettings(payload);

    if (result.success) {
      showSuccess(result.message || 'Valori aggiornati con successo');
      await loadSettings(true);
    } else {
      showError(result.message || 'Aggiornamento fallito');
    }

    setSaving(false);
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <SlidersHorizontal className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Esito Impostazioni</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 p-2">
          Gestisci i valori di soglia per l&apos;esito delle differenze lato destro e sinistro.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Caricamento impostazioni esito...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">Errore: {error}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    Parametro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    Valore
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, index) => (
                  <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-900">
                      {row.fullName}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formValues[row.key]}
                          onChange={(event) => handleInputChange(row.key, event.target.value)}
                          onKeyDown={(event) => handleInputKeyDown(event, row.key)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Inserisci valore"
                        />

                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleStepChange(row.key, 'up')}
                            className="px-2 py-1 border border-gray-300 rounded-t-md bg-white hover:bg-gray-100"
                            aria-label={`Incrementa ${row.fullName} di 0.01`}
                            title="Incrementa di 0.01"
                          >
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepChange(row.key, 'down')}
                            className="px-2 py-1 border border-t-0 border-gray-300 rounded-b-md bg-white hover:bg-gray-100"
                            aria-label={`Decrementa ${row.fullName} di 0.01`}
                            title="Decrementa di 0.01"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600">
              Inserisci il valore o usa le frecce per aumentare o diminuire di 0.01, poi salva.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadSettings(true)}
                disabled={refreshing || saving}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Ricarica
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!record || saving || !hasChanges}
                className={`px-4 py-2 text-sm rounded-md text-white flex items-center gap-2 ${!record || saving || !hasChanges
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvataggio...' : 'Salva valori'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EsitoImpostazioni;
