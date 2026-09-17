import React from 'react';
import { ESITO_DIMENSIONI, ESITO_STATE } from '../services/esitoDisplay';

const getEsitoLabel = (state) => {
  switch (state) {
    case ESITO_STATE.OK:
      return 'OK';
    case ESITO_STATE.KO:
      return 'KO';
    default:
      return '-';
  }
};

const getEsitoBadgeClasses = (state) => {
  switch (state) {
    case ESITO_STATE.OK:
      return 'bg-green-100 text-green-800';
    case ESITO_STATE.KO:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const formatAbilita = (value) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return value ? 'Sì' : 'No';
};

const formatScostamento = (value) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return String(value);
};

/**
 * Sezione "Controllo Qualità" dei modali di dettaglio: una card per dimensione CQ
 * (Articolo | Colore) con Abilitato / Esito / Scostamento. Le dimensioni e le regole
 * OK/KO/non testato vengono da esitoDisplay; qui solo lo stile.
 */
const EsitoCqPanel = ({ record }) => {
  if (!record) {
    return null;
  }

  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Controllo Qualità</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ESITO_DIMENSIONI.map((dim) => {
          const state = dim.resolve(record);

          return (
            <div key={dim.key} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{dim.label}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Abilitato</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatAbilita(dim.readAbilita(record))}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Esito</p>
                  <span className={`mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getEsitoBadgeClasses(state)}`}>
                    {getEsitoLabel(state)}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Scostamento</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatScostamento(dim.readScostamento(record))}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EsitoCqPanel;
