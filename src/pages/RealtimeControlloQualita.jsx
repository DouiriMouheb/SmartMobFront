import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Activity, 
  Clock, 
  Hash, 
  Eye,
  EyeOff,
  CheckCircle,
  Loader,
  Camera,
  Package,
  ShoppingCart
} from 'lucide-react';
import useAcquisizioniRealtime from '../hooks/useAcquisizioniRealtime';

const RealtimeControlloQualita = () => {
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

  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  // Handle record selection for details view
  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  // Get quality control result badge
  const getQualityBadge = (esito) => {
    if (esito === null || esito === undefined) return null;
    
    // Handle boolean values
    if (typeof esito === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          esito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {esito ? 'OK' : 'KO'}
        </span>
      );
    }
    
    // Handle string values
    const esitoStr = String(esito).toLowerCase();
    const isSuccess = esitoStr.includes('ok') || esitoStr.includes('pass') || esitoStr === 'true';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {String(esito)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Real-time Controllo Qualità
        </h1>
        <p className="text-gray-600">
          Monitoraggio in tempo reale delle acquisizioni di controllo qualità
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${bg}`}>
              <StatusIcon className={`w-6 h-6 ${color} ${(isConnecting || isReconnecting) ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stato Connessione</h3>
              <p className={`text-sm font-medium ${color}`}>{statusText}</p>
              {connectionId && (
                <p className="text-xs text-gray-500">ID: {connectionId}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Statistics */}
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-2xl font-bold text-gray-900">{recordCount}</span>
              </div>
              <p className="text-xs text-gray-500">Record</p>
            </div>

            {lastUpdated && (
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatTimestamp(lastUpdated).split(' ')[1]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Ultimo aggiornamento</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Aggiorna</span>
              </button>

              {isDisconnected && (
                <button
                  onClick={reconnect}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Riconnetti</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Acquisizioni in Tempo Reale</span>
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center space-x-1"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}</span>
            </button>
          </div>
        </div>

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linea</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Postazione</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articolo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CQ Articolo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CQ Box</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CQ Abilitato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Inserimento</th>
                  {showDetails && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {acquisizioni.map((record, index) => (
                  <tr 
                    key={record.id || index} 
                    className={`hover:bg-gray-50 transition-colors ${showDetails ? 'cursor-pointer' : ''}`}
                    onClick={showDetails ? () => handleRecordClick(record) : undefined}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {record.coD_LINEA || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {record.coD_POSTAZIONE || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{record.codicE_ARTICOLO || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        <span>{record.codicE_ORDINE || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getQualityBadge(record.esitO_CQ_ARTICOLO)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getQualityBadge(record.esitO_CQ_BOX)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getQualityBadge(record.abilitA_CQ)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-1">
                        {record.fotO_SUPERIORE && (
                          <Camera className="w-4 h-4 text-green-500" title="Foto Superiore" />
                        )}
                        {record.fotO_FRONTALE && (
                          <Camera className="w-4 h-4 text-blue-500" title="Foto Frontale" />
                        )}
                        {record.fotO_BOX && (
                          <Camera className="w-4 h-4 text-purple-500" title="Foto Box" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(record.dT_INS)}
                    </td>
                    {showDetails && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Dettagli
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dettagli Acquisizione #{selectedRecord.id}
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Codice Linea</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.coD_LINEA || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Codice Postazione</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.coD_POSTAZIONE || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Codice Articolo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.codicE_ARTICOLO || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Codice Ordine</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.codicE_ORDINE || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Abilitazione CQ</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.abilitA_CQ !== null ? (selectedRecord.abilitA_CQ ? 'Sì' : 'No') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Esito CQ Articolo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.esitO_CQ_ARTICOLO !== null ? (selectedRecord.esitO_CQ_ARTICOLO ? 'OK' : 'KO') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Esito CQ Box</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.esitO_CQ_BOX !== null ? (selectedRecord.esitO_CQ_BOX ? 'OK' : 'KO') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scostamento CQ Articolo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.scostamentO_CQ_ARTICOLO || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confidenza CQ Box</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.confidenzA_CQ_BOX || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Inserimento</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedRecord.dT_INS)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Aggiornamento</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedRecord.dT_AGG)}</p>
                  </div>
                </div>
                
                {/* Photo information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto Disponibili</label>
                  <div className="flex space-x-4">
                    {selectedRecord.fotO_SUPERIORE && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Foto Superiore</span>
                    )}
                    {selectedRecord.fotO_FRONTALE && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Foto Frontale</span>
                    )}
                    {selectedRecord.fotO_BOX && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Foto Box</span>
                    )}
                    {!selectedRecord.fotO_SUPERIORE && !selectedRecord.fotO_FRONTALE && !selectedRecord.fotO_BOX && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Nessuna foto disponibile</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeControlloQualita;
