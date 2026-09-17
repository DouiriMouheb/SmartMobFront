import React, { useCallback, useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  Clock,
  Hash,
  CheckCircle,
  Loader,
  Camera,
  Package,
  ShoppingCart,
  Eye,
  CloudCog,
  Palette
} from 'lucide-react';
import useAcquisizioniRealtime from '../hooks/useAcquisizioniRealtime';
import Modal from '../components/Modal';
import ImageLightbox from '../components/ImageLightbox';
import { getFotoList } from '../services/acquisizioniNormalizer';
import { ESITO_DIMENSIONI, ESITO_STATE } from '../services/esitoDisplay';

// Regole in ../services/esitoDisplay: abilita 0 => non testato,
// altrimenti esito 1 => APPROVATO (verde), esito 0 => RESPINTO (rosso),
// esito null => non testato.
// Gli helper ricevono lo STATO (da dim.resolve) cosi' valgono per articolo e colore.
const getQualitySquareColor = (state) => {
  switch (state) {
    case ESITO_STATE.OK:
      return 'bg-green-500';
    case ESITO_STATE.KO:
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getQualityIcon = (state) => {
  switch (state) {
    case ESITO_STATE.OK:
      return '✓';
    case ESITO_STATE.KO:
      return '✗';
    default:
      return '-';
  }
};

const getQualityText = (state) => {
  switch (state) {
    case ESITO_STATE.OK:
      return 'APPROVATO';
    case ESITO_STATE.KO:
      return 'RESPINTO';
    default:
      return 'NON TESTATO';
  }
};

// Sì / No / N/A per i flag abilita (ABILITA_CQ_COLORE puo' essere null).
const formatAbilita = (value) => (value === null || value === undefined ? 'N/A' : value ? 'Sì' : 'No');

const RealtimeControlloQualita = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, src: '', title: '' });
  // Immagini che hanno dato 404: mostrano il placeholder al posto dell'icona rotta.
  const [failedImages, setFailedImages] = useState({});

  const markImageFailed = useCallback(
    (src) => setFailedImages((current) => ({ ...current, [src]: true })),
    []
  );

  const {
    connectionState,
    connectionId,
    isLoading,
    error,
    acquisizioni,
    lastUpdated,
    recordCount,
    reconnect,
    refreshData,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
  } = useAcquisizioniRealtime();

  // Apre la foto nel visualizzatore a schermo intero con zoom/pan.
  const handleImageOpen = (imageUrl, title = '') => {
    if (imageUrl) {
      setLightbox({ open: true, src: imageUrl, title });
    }
  };

  const handleLightboxClose = useCallback(
    () => setLightbox((current) => ({ ...current, open: false })),
    []
  );

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid Date';
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

  // Get connection status icon and color
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'Connected':
        return { icon: Wifi, color: 'text-green-500', bg: 'bg-green-100', text: 'Connesso' };
      case 'Connecting':
      case 'Reconnecting':
        return { icon: RefreshCw, color: 'text-yellow-500', bg: 'bg-yellow-100', text: isReconnecting ? 'Riconnessione...' : 'Connessione...' };
      case 'Disconnected':
      default:
        return { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-100', text: 'Disconnesso' };
    }
  };

  const { icon: StatusIcon, color, bg, text: statusText } = getConnectionStatus();

  // Modal handlers
  const handleViewClick = (record) => {
    setSelectedRecord(record);
    console.log(selectedRecord)
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="app-page-title-row">
              <Activity className="h-7 w-7 text-red-700" />
              <h1 className="app-page-title">Controllo Qualita Real-time</h1>
            </div>
            <p className="app-page-subtitle">Monitoraggio continuo delle ultime acquisizioni e stato connessione.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshData}
              className="app-btn-secondary"
              disabled={isLoading}
            >
              <CloudCog className="h-4 w-4" />
              Aggiorna
            </button>
            <button
              type="button"
              onClick={reconnect}
              className="app-btn-primary"
              disabled={isConnecting || isReconnecting || isConnected}
            >
              <RefreshCw className={`h-4 w-4 ${isConnecting || isReconnecting ? 'animate-spin' : ''}`} />
              Riconnetti
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Hash className="h-4 w-4 text-red-700" />
              <span className="text-xs font-semibold uppercase tracking-wide">Totale Acquisizioni</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{recordCount}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4 text-red-700" />
              <span className="text-xs font-semibold uppercase tracking-wide">Ultimo Aggiornamento</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{lastUpdated ? formatTimestamp(lastUpdated) : 'N/A'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-600">
              <StatusIcon className={`h-4 w-4 ${color} ${isConnecting || isReconnecting ? 'animate-spin' : ''}`} />
              <span className="text-xs font-semibold uppercase tracking-wide">Stato Connessione</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${bg} ${color}`}>{statusText}</span>
              {isDisconnected && <span className="text-xs text-slate-500">Nessuna connessione attiva</span>}
            </div>
            {connectionId && <p className="mt-2 text-xs text-slate-500">ID: {connectionId.substring(0, 8)}...</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="app-alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}


      {/* Data Cards */}
      {isLoading && acquisizioni.length === 0 ? (
        <div className="app-surface p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-red-700" />
          <p className="text-gray-500">Caricamento dati...</p>
        </div>
      ) : acquisizioni.length === 0 ? (
        <div className="app-surface p-8 text-center">
          <Activity className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nessuna acquisizione disponibile</p>
        </div>
      ) : (
        <div className="p-2 sm:p-4">
          <div className="grid grid-cols-1 gap-8">
            {acquisizioni.map((record, index) => {
              return (
                <div
                  key={record.id || index}
                  className="bg-white border-2 rounded-xl p-8 hover:shadow-xl transition-all duration-300 border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                    {/* Left side - Info fields */}
                    <div className="flex-shrink-0 lg:w-2/5 space-y-6">
                      <div className={`flex items-right-2 px-3 py-2 rounded-lg ${bg}`}>
                        <StatusIcon className={`w-5 h-5 ${color} ${(isConnecting || isReconnecting) ? 'animate-spin' : ''}`} />
                        <span className={`font-medium ${color}`}>{statusText}</span>
                      </div>

                      <div className="text-center lg:text-left">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                          Codice Articolo
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                          <Package className="w-6 h-6 text-gray-400" />
                          <span className="text-2xl font-bold text-gray-900">
                            {record.codicE_ARTICOLO || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="text-center lg:text-left">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                          Codice Ordine
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                          <span className="text-2xl font-bold text-gray-900">
                            {record.codicE_ORDINE || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Flag abilita per le due dimensioni CQ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-center lg:text-left">
                          <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Abilita CQ Articolo
                          </label>
                          <div className="flex items-center justify-center lg:justify-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-gray-400" />
                            <span className="text-2xl font-bold text-gray-900">
                              {formatAbilita(record.abilitA_CQ)}
                            </span>
                          </div>
                        </div>

                        <div className="text-center lg:text-left">
                          <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Abilita CQ Colore
                          </label>
                          <div className="flex items-center justify-center lg:justify-start space-x-3">
                            <Palette className="w-6 h-6 text-gray-400" />
                            <span className="text-2xl font-bold text-gray-900">
                              {formatAbilita(record.abilitA_CQ_COLORE)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <label className="block text-base font-semibold text-gray-700 mb-3">
                         Indici calcolati
                        </label>
                        <div className="overflow-x-auto">
                          <div className="grid grid-cols-4 gap-2 min-w-[32rem]">
                            <div className="bg-white border border-gray-200 rounded p-2">
                              <p className="text-xs text-gray-500 mb-1">DALD</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(record.rightSideAngleDifferent)}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded p-2">
                              <p className="text-xs text-gray-500 mb-1">DDLD</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(record.rightSideMisalignmentDifferent)}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded p-2">
                              <p className="text-xs text-gray-500 mb-1">DALS</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(record.leftSideAngleDifferent)}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded p-2">
                              <p className="text-xs text-gray-500 mb-1">DDLS</p>
                              <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(record.leftSideMisalignmentDifferent)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Always show additional info */}
                      <div className="pt-4 border-t border-gray-200 space-y-3 text-center lg:text-left">
                        <div className="text-lg text-gray-600">
                          <strong>ID:</strong> {record.id}
                        </div>
                        <div className="text-lg text-gray-600">
                          <strong>Data:</strong> {formatTimestamp(record.dT_INS)}
                        </div>
                      </div>
                    </div>

                    {/* Center - Quality squares, one per CQ dimension (articolo + colore) */}
                    <div className="flex-grow flex flex-col items-center justify-center lg:w-3/5">
                      <div className="flex w-full flex-col sm:flex-row flex-wrap items-start justify-center gap-6 xl:gap-8">
                        {ESITO_DIMENSIONI.map((dim) => {
                          const state = dim.resolve(record);
                          return (
                            <div key={dim.key} className="flex flex-col items-center">
                              <label className="block text-lg xl:text-xl font-bold text-gray-700 mb-3 text-center">
                                {dim.label}
                              </label>
                              <div
                                className={`w-56 h-56 lg:w-48 lg:h-48 xl:w-64 xl:h-64 2xl:w-80 2xl:h-80 rounded-2xl ${getQualitySquareColor(state)}
                                  shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
                              >
                                <span className="text-white font-bold text-5xl xl:text-6xl 2xl:text-7xl">
                                  {getQualityIcon(state)}
                                </span>
                              </div>
                              <div className="mt-3 text-base xl:text-lg font-semibold text-center text-gray-600">
                                {getQualityText(state)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handleViewClick(record)}
                        className="mt-6 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2 transition-colors"
                      >
                        <Eye size={20} />
                        Visualizza Dettagli
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        title="Dettagli Acquisizione Real-time"
        size="2xl"
        className="max-w-6xl mx-auto"
        footer={
          <button
            type="button"
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={handleCloseModal}
          >
            Chiudi
          </button>
        }
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Compact Header with Status */}
            <div className="bg-gradient-to-r from-slate-100 to-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Acquisizione #{selectedRecord.id}</h3>
                    <p className="text-xs text-gray-600">{formatTimestamp(selectedRecord.dT_INS)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {ESITO_DIMENSIONI.map((dim) => {
                      const state = dim.resolve(selectedRecord);
                      return (
                        <div key={dim.key} className="flex items-center gap-2" title={dim.label}>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs ${getQualitySquareColor(state)}`}
                          >
                            {getQualityIcon(state)}
                          </div>
                          <span className="text-sm font-bold">{getQualityText(state)}</span>
                          <span className="text-xs uppercase tracking-wide text-gray-500">{dim.shortLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Activity className="w-3 h-3" />
                  <span>Real-time</span>
                </div>
              </div>
            </div>

            {/* Main Content - Compact Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Product Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-700" />
                  Informazioni Prodotto
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Codice Articolo</label>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold text-gray-900">{selectedRecord.codicE_ARTICOLO || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Codice Ordine</label>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold text-gray-900">{selectedRecord.codicE_ORDINE || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Indici calcolati</label>
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-4 gap-2 min-w-[32rem]">
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">DALD</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(selectedRecord.rightSideAngleDifferent)}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">DDLD</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(selectedRecord.rightSideMisalignmentDifferent)}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">DALS</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(selectedRecord.leftSideAngleDifferent)}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">DDLS</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDifferentValue(selectedRecord.leftSideMisalignmentDifferent)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            

<div className="bg-white border border-gray-200 rounded-lg p-3">
  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
    <Camera className="w-4 h-4 text-red-700" />
    Foto
  </h4>
  <div className="space-y-4">
    {getFotoList(selectedRecord).map((foto) => (
      <div key={foto.key}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{foto.label}</label>
        <div className="bg-gray-50 p-2 rounded">
          {foto.src && !failedImages[foto.src] ? (
            <div className="relative group">
              <img
                src={foto.src}
                alt={foto.label}
                className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageOpen(foto.src, foto.label)}
                onError={() => markImageFailed(foto.src)}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded cursor-pointer"
                   onClick={() => handleImageOpen(foto.src, foto.label)}>
                <Eye className="w-8 h-8 text-white" />
              </div>
              <button
                onClick={() => handleImageOpen(foto.src, foto.label)}
                className="mt-2 w-full px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800 flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Eye size={16} />
                Ingrandisci
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm bg-gray-100 rounded border">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Immagine non disponibile</p>
              </div>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>
            </div>

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
    </div>
  );
};

export default RealtimeControlloQualita;
