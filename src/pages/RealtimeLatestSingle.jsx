import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ChevronDown, 
  Loader2, 
  AlertCircle, 
  Calendar, 
  Package, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  X,
  Wifi,
  ShoppingCart,
  Camera
} from 'lucide-react';
import { useLineePostazioni } from '../hooks/useLineePostazioni';
import Modal from '../components/Modal';

const RealtimeLatestSingle = () => {
  const [selectedLinea, setSelectedLinea] = useState('');
  const [selectedPostazione, setSelectedPostazione] = useState('');
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Use the hook to get linee/postazioni data
  const { loading: dropdownLoading, error: dropdownError, getLinee, getPostazioniForLinea } = useLineePostazioni();

  // Simple fetch function
  const fetchLatestData = async () => {
    if (!selectedLinea || !selectedPostazione) return;

    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7052';
      const url = `${API_BASE_URL}/api/acquisizioni/latest-single/line/${selectedLinea}/station/${selectedPostazione}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setLatestData(data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError('Errore nel caricamento dei dati');
        setLatestData(null);
      }
    } catch (err) {
      setError('Errore di connessione');
      setLatestData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when both dropdowns are selected
  useEffect(() => {
    if (selectedLinea && selectedPostazione) {
      fetchLatestData();
      
      // Start polling every 3 seconds
      const interval = setInterval(fetchLatestData, 3000);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      setLatestData(null);
    }
  }, [selectedLinea, selectedPostazione]);

  // Reset postazione when linea changes
  useEffect(() => {
    setSelectedPostazione('');
    setLatestData(null);
  }, [selectedLinea]);

  // Get available linee and postazioni
  const linee = getLinee();
  const postazioni = selectedLinea ? getPostazioniForLinea(selectedLinea) : [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper function to format image URLs - matching RealtimeControlloQualita
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

  // Simple function to open image URL in new window - matching RealtimeControlloQualita
  const handleImageOpen = (imageUrl) => {
    if (imageUrl) {
      window.open(formatImageUrl(imageUrl), '_blank');
    }
  };

  const handleViewClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Get quality status
  const getQualityStatus = (esito) => {
    if (esito === null || esito === undefined) {
      return { color: 'bg-gray-400', text: 'NON TESTATO', icon: '-' };
    }
    return esito 
      ? { color: 'bg-green-500', text: 'APPROVATO', icon: '✓' }
      : { color: 'bg-red-500', text: 'RESPINTO', icon: '✗' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Monitoraggio Real-time</h1>
            <p className="text-gray-600 mt-1">Seleziona linea e postazione per visualizzare l'ultima acquisizione</p>
          </div>
        </div>
      </div>

      {/* Dropdown Selection Only */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Selezione Linea e Postazione</h2>
        
        {/* Loading State for dropdowns */}
        {dropdownLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Caricamento opzioni...</span>
          </div>
        )}

        {/* Error State for dropdowns */}
        {dropdownError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">Errore nel caricamento delle opzioni: {dropdownError}</span>
            </div>
          </div>
        )}

        {/* Dropdowns */}
        {!dropdownLoading && !dropdownError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Linea Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Linea di Produzione
              </label>
              <div className="relative">
                <select
                  value={selectedLinea}
                  onChange={(e) => setSelectedLinea(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer text-gray-900"
                >
                  <option value="">Seleziona una linea...</option>
                  {linee.map((linea) => (
                    <option key={linea.value} value={linea.value}>
                      {linea.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Postazione Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Postazione
              </label>
              <div className="relative">
                <select
                  value={selectedPostazione}
                  onChange={(e) => setSelectedPostazione(e.target.value)}
                  disabled={!selectedLinea || postazioni.length === 0}
                  className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer text-gray-900 ${
                    !selectedLinea || postazioni.length === 0 
                      ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                      : ''
                  }`}
                >
                  <option value="">
                    {!selectedLinea 
                      ? 'Prima seleziona una linea...' 
                      : postazioni.length === 0 
                        ? 'Nessuna postazione disponibile' 
                        : 'Seleziona una postazione...'
                    }
                  </option>
                  {postazioni.map((postazione) => (
                    <option key={postazione.value} value={postazione.value}>
                      {postazione.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Display Section - Same layout as Real-time Controllo */}
      {selectedLinea && selectedPostazione && (
        <div className="bg-white rounded-lg shadow-md">
          {/* Loading state */}
          {loading && !latestData && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Caricamento ultima acquisizione...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">Errore: {error}</span>
              </div>
            </div>
          )}

          {/* No data state */}
          {!loading && !error && !latestData && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Nessuna acquisizione trovata</p>
              <p className="text-sm">Non ci sono ancora acquisizioni per questa combinazione.</p>
            </div>
          )}

          {/* Data display - matching Real-time Controllo layout */}
          {latestData && (
            <div className="p-8">
              <div className="bg-white border-2 rounded-xl p-8 border-gray-200">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                  {/* Left side - Info fields */}
                  <div className="flex-shrink-0 lg:w-2/5 space-y-6">
                    {/* Connection status */}
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Connesso</span>
                      </div>
                    </div>

                    <div className="text-center lg:text-left">
                      <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Codice Articolo
                      </label>
                      <div className="flex items-center justify-center lg:justify-start space-x-3">
                        <Package className="w-6 h-6 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">
                          {latestData.codicE_ARTICOLO || 'N/A'}
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
                          {latestData.codicE_ORDINE || 'N/A'}
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
                          {latestData.abilitA_CQ !== null ? (latestData.abilitA_CQ ? 'Sì' : 'No') : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Additional info */}
                    <div className="pt-4 border-t border-gray-200 space-y-3 text-center lg:text-left">
                      <div className="text-lg text-gray-600">
                        <strong>ID:</strong> {latestData.id}
                      </div>
                      <div className="text-lg text-gray-600">
                        <strong>Data:</strong> {formatDate(latestData.dT_INS)}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Large Quality Status Card */}
                  <div className="flex-grow flex flex-col items-center justify-center lg:w-3/5">
                    <label className="block text-xl font-bold text-gray-700 mb-4 text-center">
                      Esito CQ Articolo
                    </label>
                    <div
                      className={`w-80 h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] rounded-2xl ${getQualityStatus(latestData.esitO_CQ_ARTICOLO).color} 
                        shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
                    >
                      <span className="text-white font-bold text-6xl lg:text-7xl xl:text-8xl">
                        {getQualityStatus(latestData.esitO_CQ_ARTICOLO).icon}
                      </span>
                    </div>
                    <div className="mt-4 text-lg font-semibold text-center text-gray-600">
                      {getQualityStatus(latestData.esitO_CQ_ARTICOLO).text}
                    </div>
                    <button
                      onClick={handleViewClick}
                      className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
                    >
                      <Eye size={20} />
                      Visualizza Dettagli
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal - Only opens when "Visualizza Dettagli" is clicked */}
      <Modal
        open={isModalOpen}
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
        {latestData && (
          <div className="space-y-4">
            {/* Compact Header with Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Acquisizione #{latestData.id}</h3>
                    <p className="text-xs text-gray-600">{formatDate(latestData.dT_INS)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs ${getQualityStatus(latestData.esitO_CQ_ARTICOLO).color}`}
                    >
                      {getQualityStatus(latestData.esitO_CQ_ARTICOLO).icon}
                    </div>
                    <span className="text-sm font-bold">
                      {getQualityStatus(latestData.esitO_CQ_ARTICOLO).text}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Wifi className="w-3 h-3" />
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
                      <p className="text-sm font-semibold text-gray-900">{latestData.codicE_ARTICOLO || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Codice Ordine</label>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold text-gray-900">{latestData.codicE_ORDINE || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scostamento CQ</label>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold text-gray-900">{latestData.scostamentO_CQ_ARTICOLO}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos Section - Matching Real-time Controllo */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Foto
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Foto Superiore</label>
                    <div className="bg-gray-50 p-2 rounded">
                      {latestData.fotO_SUPERIORE ? (
                        <div className="relative group">
                          <img 
                            src={formatImageUrl(latestData.fotO_SUPERIORE)} 
                            alt="Foto Superiore"
                            className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageOpen(latestData.fotO_SUPERIORE)}
                            onError={(e) => {
                              console.log('Image failed to load:', e.target.src);
                              console.log('Original path:', latestData.fotO_SUPERIORE);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded cursor-pointer"
                               onClick={() => handleImageOpen(latestData.fotO_SUPERIORE)}>
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                          <button
                            onClick={() => handleImageOpen(latestData.fotO_SUPERIORE)}
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
                          <p className="text-xs mt-1">Path: {latestData.fotO_SUPERIORE}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Foto Frontale</label>
                    <div className="bg-gray-50 p-2 rounded">
                      {latestData.fotO_FRONTALE ? (
                        <div className="relative group">
                          <img 
                            src={formatImageUrl(latestData.fotO_FRONTALE)} 
                            alt="Foto Frontale"
                            className="w-full h-40 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageOpen(latestData.fotO_FRONTALE)}
                            onError={(e) => {
                              console.log('Image failed to load:', e.target.src);
                              console.log('Original path:', latestData.fotO_FRONTALE);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded cursor-pointer"
                               onClick={() => handleImageOpen(latestData.fotO_FRONTALE)}>
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                          <button
                            onClick={() => handleImageOpen(latestData.fotO_FRONTALE)}
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
                          <p className="text-xs mt-1">Path: {latestData.fotO_FRONTALE}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information - Full Width */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                Informazioni Sistema
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-2 rounded">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Linea</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedLinea}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Postazione</label>
                  <p className="text-sm font-semibold text-gray-900">{selectedPostazione}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Abilita CQ</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {latestData.abilitA_CQ !== null ? (latestData.abilitA_CQ ? 'Sì' : 'No') : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ID Acquisizione</label>
                  <p className="text-sm font-semibold text-gray-900">{latestData.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RealtimeLatestSingle;