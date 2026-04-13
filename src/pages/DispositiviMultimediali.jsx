import React from 'react';
import DispositiviMultimedialiTable from '../components/DispositiviMultimedialiTable';
import { useDispositiviMultimediali } from '../hooks/useDispositiviMultimediali';
import { Monitor, Loader2, AlertTriangle } from 'lucide-react';

const DispositiviMultimediali = () => {
  const { records, loading, error, updateRecord, refreshRecords } = useDispositiviMultimediali();

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div className="app-page-title-row">
          <Monitor className="h-7 w-7 text-red-700" />
          <h1 className="app-page-title">Dispositivi Multimediali</h1>
        </div>
        <p className="app-page-subtitle">
          Configurazione e gestione anagrafica dei dispositivi collegati.
        </p>
      </div>

      {loading && (
        <div className="app-surface flex items-center justify-center py-10">
          <Loader2 className="app-spinner" />
        </div>
      )}

      {error && !loading && (
        <div className="app-alert-warning mb-4">
          <div className="flex">
            <div className="text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">API non disponibile</h3>
              <p className="mt-1 text-sm text-amber-700">L'API per i dispositivi multimediali non e ancora pronta. La tabella verra caricata automaticamente quando l'API sara disponibile.</p>
            </div>
          </div>
        </div>
      )}

      <DispositiviMultimedialiTable data={records} updateRecord={updateRecord} refreshRecords={refreshRecords} />
    </div>
  );
};

export default DispositiviMultimediali;
