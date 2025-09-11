import React, { useState } from 'react';
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
  CloudCog
} from 'lucide-react';
import useAcquisizioniRealtime from '../hooks/useAcquisizioniRealtime';
import Modal from '../components/Modal';

const RealtimeControlloQualita = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  // Helper function to format image URLs
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a proper web URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it starts with //, add https:
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }
    
    // If it's a relative path, assume it's from your domain
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // Handle database format like "192.168.1.90/public/Canon%20EOS%20R100/100CANON/IMG_0317.JPG"
    // Use HTTP protocol for network file access (assumes the server has HTTP file sharing enabled)
    if (imageUrl.match(/^\d+\.\d+\.\d+\.\d+\//) || (imageUrl.includes('.') && !imageUrl.includes(' '))) {
      return `http://${imageUrl}`;
    }
    
    return imageUrl;
  };

  // Simple function to open image URL in new window
  const handleImageOpen = (imageUrl) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

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

  // Get quality control result badge
  const getQualityBadge = (esito) => {
    if (esito === null || esito === undefined) return null;

    // Handle boolean values
    if (typeof esito === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${esito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {esito ? 'OK' : 'NOT OK'}
        </span>
      );
    }

    // Handle string values
    const esitoStr = String(esito).toLowerCase();
    const isSuccess = esitoStr.includes('ok') || esitoStr.includes('pass') || esitoStr === 'true';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {String(esito)}
      </span>
    );
  };

  return (
    <div className="p-2 max-w-7xl mx-auto">
      {/*
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Controllo Qualità Real-time</h1>
          <div className="flex items-center gap-4">
          
            {connectionId && (
              <div className="text-sm text-gray-600">
                ID: {connectionId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
        
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Acquisizioni Totali</p>
                <p className="text-xl font-bold text-gray-900">{recordCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Ultimo Aggiornamento</p>
                <p className="text-xl font-bold text-gray-900">
                  {lastUpdated ? formatTimestamp(lastUpdated) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Stato Connessione</p>
                <p className="text-xl font-bold text-gray-900">{statusText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    */}


      {/* Data Cards */}
      {isLoading && acquisizioni.length === 0 ? (
        <div className="p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Caricamento dati...</p>
        </div>
      ) : acquisizioni.length === 0 ? (
        <div className="p-8 text-center">
          <Activity className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nessuna acquisizione disponibile</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8">
            {acquisizioni.map((record, index) => {
              // Determine the color of the quality indicator square
              const getQualitySquareColor = (esito) => {
                if (esito === null || esito === undefined) {
                  return 'bg-gray-400'; // Gray for null
                }
                return esito ? 'bg-green-500' : 'bg-red-500'; // Green for true, red for false
              };

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

                      <div className="text-center lg:text-left">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                          Abilita CQ
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                          <CheckCircle className="w-6 h-6 text-gray-400" />
                          <span className="text-2xl font-bold text-gray-900">
                            {record.abilitA_CQ !== null ? (record.abilitA_CQ ? 'Sì' : 'No') : 'N/A'}
                          </span>
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

                    {/* Center - Quality indicator square (60% of screen width) */}
                    <div className="flex-grow flex flex-col items-center justify-center lg:w-3/5">
                      <label className="block text-xl font-bold text-gray-700 mb-4 text-center">
                        Esito CQ Articolo
                      </label>
                      <div
                        className={`w-80 h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] rounded-2xl ${getQualitySquareColor(record.esitO_CQ_ARTICOLO)} 
                          shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
                      >
                        <span className="text-white font-bold text-6xl lg:text-7xl xl:text-8xl">
                          {record.esitO_CQ_ARTICOLO === null || record.esitO_CQ_ARTICOLO === undefined
                            ? '-'
                            : record.esitO_CQ_ARTICOLO
                              ? '✓'
                              : '✗'
                          }
                        </span>
                      </div>
                      <div className="mt-4 text-lg font-semibold text-center text-gray-600">
                        {record.esitO_CQ_ARTICOLO === null || record.esitO_CQ_ARTICOLO === undefined
                          ? 'NON TESTATO'
                          : record.esitO_CQ_ARTICOLO
                            ? 'APPROVATO'
                            : 'RESPINTO'
                        }
                      </div>
                      <button
                        onClick={() => handleViewClick(record)}
                        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Acquisizione #{selectedRecord.id}</h3>
                    <p className="text-xs text-gray-600">{formatTimestamp(selectedRecord.dT_INS)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs ${selectedRecord.esitO_CQ_ARTICOLO === null || selectedRecord.esitO_CQ_ARTICOLO === undefined
                        ? 'bg-gray-400'
                        : selectedRecord.esitO_CQ_ARTICOLO
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        }`}
                    >
                      {selectedRecord.esitO_CQ_ARTICOLO === null || selectedRecord.esitO_CQ_ARTICOLO === undefined
                        ? '-'
                        : selectedRecord.esitO_CQ_ARTICOLO
                          ? '✓'
                          : '✗'
                      }
                    </div>
                    <span className="text-sm font-bold">
                      {selectedRecord.esitO_CQ_ARTICOLO === null || selectedRecord.esitO_CQ_ARTICOLO === undefined
                        ? 'NON TESTATO'
                        : selectedRecord.esitO_CQ_ARTICOLO
                          ? 'APPROVATO'
                          : 'RESPINTO'
                      }
                    </span>
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
                  <Package className="w-4 h-4 text-blue-500" />
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
                </div>
              </div>
            

<div className="bg-white border border-gray-200 rounded-lg p-3">
  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
    <Camera className="w-4 h-4 text-blue-500" />
    Foto
  </h4>
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Foto Superiore</label>
      <div className="bg-gray-50 p-2 rounded">
        {selectedRecord.fotO_SUPERIORE ? (
          <div className="relative group">
            <img 
              src={selectedRecord.fotO_SUPERIORE} 
              alt="Foto Superiore"
              className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageOpen(selectedRecord.fotO_SUPERIORE)}
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                console.log('Original path:', selectedRecord.fotO_SUPERIORE);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded cursor-pointer"
                 onClick={() => handleImageOpen(selectedRecord.fotO_SUPERIORE)}>
              <Eye className="w-8 h-8 text-white" />
            </div>
            <button
              onClick={() => handleImageOpen(selectedRecord.fotO_SUPERIORE)}
              className="mt-2 w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Eye size={16} />
              Apri in nuova finestra
            </button>
          </div>
        ) : null}
        <div className="hidden items-center justify-center h-40 text-gray-500 text-sm bg-gray-100 rounded border">
          <div className="text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Immagine non disponibile</p>
            <p className="text-xs mt-1">Path: {selectedRecord.fotO_SUPERIORE}</p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Foto Frontale</label>
      <div className="bg-gray-50 p-2 rounded">
        {selectedRecord.fotO_FRONTALE ? (
          <div className="relative group">
            <img 
              src={selectedRecord.fotO_FRONTALE} 
              alt="Foto Frontale"
              className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageOpen(selectedRecord.fotO_FRONTALE)}
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                console.log('Original path:', selectedRecord.fotO_FRONTALE);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded cursor-pointer"
                 onClick={() => handleImageOpen(selectedRecord.fotO_FRONTALE)}>
              <Eye className="w-8 h-8 text-white" />
            </div>
            <button
              onClick={() => handleImageOpen(selectedRecord.fotO_FRONTALE)}
              className="mt-2 w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Eye size={16} />
              Apri in nuova finestra
            </button>
          </div>
        ) : null}
        <div className="hidden items-center justify-center h-40 text-gray-500 text-sm bg-gray-100 rounded border">
          <div className="text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Immagine non disponibile</p>
            <p className="text-xs mt-1">Path: {selectedRecord.fotO_FRONTALE}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>



              {/* Quality Control 
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Controllo Qualità
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Abilita CQ</label>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${selectedRecord.abilitA_CQ ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRecord.abilitA_CQ !== null ? (selectedRecord.abilitA_CQ ? 'Sì' : 'No') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Esito CQ</label>
                    <div className={`p-2 rounded border ${selectedRecord.esitO_CQ_ARTICOLO === null || selectedRecord.esitO_CQ_ARTICOLO === undefined
                        ? 'bg-gray-50 border-gray-300'
                        : selectedRecord.esitO_CQ_ARTICOLO
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                      }`}>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedRecord.esitO_CQ_ARTICOLO === null || selectedRecord.esitO_CQ_ARTICOLO === undefined
                          ? 'Non Testato'
                          : selectedRecord.esitO_CQ_ARTICOLO
                            ? 'Approvato'
                            : 'Respinto'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>*/}
            </div>

            {/* Technical Details - Compact Grid 
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-500" />
                Dettagli Tecnici
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-gray-50 p-2 rounded">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ID Record</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedRecord.id || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Timestamp</label>
                  <p className="text-xs font-semibold text-gray-900">{formatTimestamp(selectedRecord.dT_INS)}</p>
                </div>

                {/* Dynamic fields for any additional properties 
                {Object.entries(selectedRecord).map(([key, value]) => {
                  // Skip already displayed fields
                  if (['id', 'dT_INS', 'codicE_ARTICOLO', 'codicE_ORDINE', 'abilitA_CQ', 'esitO_CQ_ARTICOLO'].includes(key)) {
                    return null;
                  }

                  // Create better field labels
                  const getFieldLabel = (fieldKey) => {
                    const fieldMap = {
                      'coD_LINEA': 'Codice Linea',
                      'coD_POSTAZIONE': 'Codice Postazione',
                      'foT_O_SUPERIORE': 'Foto Superiore',
                      'foT_O_FRONTALE': 'Foto Frontale',
                      'foT_O_BOX': 'Foto Box',
                      'esiT_O_CQ_BOX': 'Esito CQ Box',
                      'confidenZ_A_CQ_BOX': 'Confidenza CQ Box',
                      'scostamenT_O_CQ_ART_ICOLO': 'Scostamento CQ Articolo',
                      'dT_AGG': 'Data Aggiornamento'
                    };

                    if (fieldMap[fieldKey]) {
                      return fieldMap[fieldKey];
                    }

                    // Fallback: clean up the field name
                    return fieldKey
                      .replace(/_/g, ' ')
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/\s+/g, ' ')
                      .trim()
                      .toLowerCase()
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  };

                  return (
                    <div key={key} className="bg-gray-50 p-2 rounded">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {getFieldLabel(key)}
                      </label>
                      <p className="text-xs font-semibold text-gray-900 break-all">
                        {value !== null && value !== undefined ? String(value) : 'N/A'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div> Grid */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RealtimeControlloQualita;
