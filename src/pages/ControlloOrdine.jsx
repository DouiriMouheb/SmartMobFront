import React, { useCallback, useMemo, useState } from 'react';
import {
  AlertCircle,
  Factory,
  FileBox,
  Info,
  Loader2,
  PackageSearch,
  Search,
  X,
  ZoomIn,
} from 'lucide-react';
import Modal from '../components/Modal';
import ImageLightbox from '../components/ImageLightbox';
import UserReviewPanel from '../components/UserReviewPanel';
import EsitoCqPanel from '../components/EsitoCqPanel';
import { useControlloOrdine } from '../hooks/useControlloOrdine';
import { useUserReview } from '../hooks/useUserReview';
import { getFotoList } from '../services/acquisizioniNormalizer';
import { groupByLineaPostazione, summarizeOrdine } from '../services/controlloOrdineService';
import { ESITO_DIMENSIONI, ESITO_STATE } from '../services/esitoDisplay';

// Gli helper ricevono lo STATO (da dim.resolve), cosi' valgono per articolo e colore.
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

const formatDifferentValue = (value) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No';
  }

  return String(value);
};

const formatDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const ControlloOrdine = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedAcquisizione, setSelectedAcquisizione] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, src: '', title: '' });

  const {
    data,
    loading,
    error,
    searchedCode,
    hasSearched,
    search,
    reset,
  } = useControlloOrdine();

  const review = useUserReview(data);

  const groups = useMemo(() => groupByLineaPostazione(data), [data]);
  const summary = useMemo(() => summarizeOrdine(data), [data]);

  // La nota si salva su blur: chiudendo dal backdrop il blur puo' non scattare,
  // quindi si forza il flush prima di smontare il modal.
  const handleCloseDetails = useCallback(() => {
    review.flush(selectedAcquisizione);
    setSelectedAcquisizione(null);
  }, [review, selectedAcquisizione]);

  const handleSubmit = (event) => {
    event.preventDefault();
    search(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    reset();
  };

  const handleImageOpen = (src, title) => {
    if (src) {
      setLightbox({ open: true, src, title });
    }
  };

  const handleLightboxClose = useCallback(
    () => setLightbox((current) => ({ ...current, open: false })),
    []
  );

  const renderFoto = (record, foto) => {
    const caption = `#${record.id} · ${foto.label}`;

    return (
      <div key={`${record.id}-${foto.key}`} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {foto.src ? (
          <button
            type="button"
            onClick={() => handleImageOpen(foto.src, `${caption} · Ordine ${searchedCode}`)}
            title="Clicca per ingrandire"
            className="group relative block w-full cursor-zoom-in"
          >
            <img
              src={foto.src}
              alt={caption}
              loading="lazy"
              className="h-44 w-full bg-gray-100 object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-8 w-8 text-white" />
            </span>
          </button>
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gray-50 px-3 text-center text-sm text-gray-500">
            Nessuna immagine disponibile
          </div>
        )}

        <p className="truncate border-t border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-600">
          {foto.label}
        </p>
      </div>
    );
  };

  // Una card per acquisizione con dentro le sue foto: superiore + frontale e la
  // corretta solo quando il backend l'ha valorizzata (abilitaCq = 1). Tenerle
  // insieme e' il punto: si confrontano le foto dello STESSO pezzo.
  const renderAcquisizioneCard = (record) => {
    const fotoList = getFotoList(record);

    return (
      <div
        key={record.id}
        className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 transition hover:border-gray-300"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-gray-800">#{record.id}</span>
          <span className="font-mono text-xs text-gray-600">{record.codicE_ARTICOLO || 'N/A'}</span>
          {ESITO_DIMENSIONI.map((dim) => {
            const state = dim.resolve(record);
            return (
              <span
                key={dim.key}
                title={dim.label}
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getEsitoBadgeClasses(state)}`}
              >
                {dim.shortLabel} {getEsitoLabel(state)}
              </span>
            );
          })}
          <span className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-gray-500 sm:inline">
              {formatDateTime(record.dT_INS)}
            </span>
            <button
              type="button"
              onClick={() => setSelectedAcquisizione(record)}
              title="Dettagli acquisizione"
              aria-label={`Dettagli acquisizione ${record.id}`}
              className="rounded-full bg-white p-1.5 text-gray-600 shadow-sm transition hover:text-red-700"
            >
              <Info className="h-4 w-4" />
            </button>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fotoList.map((foto) => renderFoto(record, foto))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="app-page">
        {/* Header */}
        <div className="app-page-header">
          <div className="app-page-title-row">
            <PackageSearch className="w-6 h-6 sm:w-8 sm:h-8 text-red-700" />
            <h1 className="app-page-title">Controllo Ordine</h1>
          </div>
          <p className="app-page-subtitle">
            Cerca un Codice Ordine e visualizza tutte le acquisizioni e le foto collegate,
            su qualunque linea e postazione
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Inserisci il Codice Ordine..."
                aria-label="Codice Ordine"
                className="block w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm transition-all duration-200 hover:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-400 sm:py-3 sm:pl-10 sm:pr-10 sm:text-base"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Cancella ricerca"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <X className="h-4 w-4 text-gray-400 transition-colors hover:text-gray-600 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 sm:py-3 ${
                !inputValue.trim() || loading
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-red-700 text-white shadow-sm hover:bg-red-800'
              }`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Cerca
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="app-spinner" />
            <span className="ml-2 text-gray-600">Ricerca in corso...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="app-alert-error mt-4">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              <span className="text-red-700">Errore nella ricerca dell'ordine: {error}</span>
            </div>
          </div>
        )}

        {/* Idle: nessuna ricerca ancora fatta */}
        {!loading && !error && !hasSearched && (
          <div className="app-surface mt-2 p-8 text-center text-gray-500 sm:mt-6">
            <PackageSearch className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>Inserisci un Codice Ordine per vedere tutte le acquisizioni e le foto collegate.</p>
          </div>
        )}

        {/* Ordine non trovato */}
        {!loading && !error && hasSearched && data.length === 0 && (
          <div className="app-surface mt-2 p-8 text-center text-gray-500 sm:mt-6">
            <PackageSearch className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-2">
              Nessuna acquisizione trovata per l'ordine &quot;{searchedCode}&quot;.
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 rounded-lg bg-red-700 px-4 py-2 text-sm text-white transition-colors hover:bg-red-800"
            >
              Cancella Ricerca
            </button>
          </div>
        )}

        {/* Riepilogo + galleria */}
        {!loading && !error && data.length > 0 && (
          <>
            <div className="app-surface mt-2 p-4 sm:mt-6 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Codice Ordine
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-800">{searchedCode}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {summary.total} {summary.total === 1 ? 'acquisizione' : 'acquisizioni'} ·{' '}
                    {groups.length} {groups.length === 1 ? 'combinazione' : 'combinazioni'} linea/postazione
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-800">
                    OK: {summary.ok}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-800">
                    KO: {summary.ko}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600">
                    Non testati: {summary.nonTestati}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <div className="mb-1 flex items-center text-red-700">
                    <FileBox className="mr-2 h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide text-red-600">
                      Articoli
                    </span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-red-800">
                    {summary.articoli.length > 0 ? summary.articoli.join(', ') : 'N/A'}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="mb-1 flex items-center text-slate-700">
                    <Factory className="mr-2 h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
                      Linee
                    </span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-slate-800">
                    {summary.linee.length > 0 ? summary.linee.join(', ') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {groups.map((group) => (
              <div key={group.key} className="app-surface mt-4 p-4 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Factory className="h-5 w-5 text-red-700" />
                  <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
                    LINEA {group.codLinea || 'N/A'} · POSTAZIONE {group.codPostazione || 'N/A'}
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'acquisizione' : 'acquisizioni'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                  {group.items.map(renderAcquisizioneCard)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Modal
        open={Boolean(selectedAcquisizione)}
        title={
          selectedAcquisizione
            ? `Dettagli acquisizione #${selectedAcquisizione.id}`
            : 'Dettagli acquisizione'
        }
        onBackdropClick={handleCloseDetails}
        size="2xl"
        className="max-w-3xl w-[95vw]"
        footer={(
          <button
            type="button"
            className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400"
            onClick={handleCloseDetails}
          >
            Chiudi
          </button>
        )}
      >
        {selectedAcquisizione && (
          <div className="space-y-5">
            <section>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                Informazioni generali
              </h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">ID</p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {selectedAcquisizione.id}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Codice Articolo
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                    {selectedAcquisizione.codicE_ARTICOLO || 'N/A'}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Codice Ordine
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                    {selectedAcquisizione.codicE_ORDINE || 'N/A'}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Linea</p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDifferentValue(selectedAcquisizione.coD_LINEA)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Postazione
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDifferentValue(selectedAcquisizione.coD_POSTAZIONE)}
                  </div>
                </div>
              </div>
            </section>

            {/* Controllo Qualità: esito + scostamento per articolo e colore */}
            <EsitoCqPanel record={selectedAcquisizione} />

            <section>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                Misurazioni
              </h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rotazione Destra
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDifferentValue(selectedAcquisizione.rightSideAngleDifferent)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Disallineamento Destro
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDifferentValue(selectedAcquisizione.rightSideMisalignmentDifferent)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rotazione Sinistra
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDifferentValue(selectedAcquisizione.leftSideAngleDifferent)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Disallineamento Sinistro
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDifferentValue(selectedAcquisizione.leftSideMisalignmentDifferent)}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Date</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Data Inserimento
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDateTime(selectedAcquisizione.dT_INS)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Data Aggiornamento
                  </p>
                  <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                    {formatDateTime(selectedAcquisizione.dT_AGG)}
                  </div>
                </div>
              </div>
            </section>

            {/* Revisione Utente */}
            <UserReviewPanel item={selectedAcquisizione} review={review} />
          </div>
        )}
      </Modal>

      <ImageLightbox
        open={lightbox.open}
        src={lightbox.src}
        alt={lightbox.title}
        title={lightbox.title}
        onClose={handleLightboxClose}
      />
    </>
  );
};

export default ControlloOrdine;
