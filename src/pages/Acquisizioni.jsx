import React, { useState, useEffect } from 'react';
import { Database, Filter, ChevronDown, Loader2, AlertCircle, Calendar, Package, Eye } from 'lucide-react';
import { useLineePostazioni } from '../hooks/useLineePostazioni';
import { useAcquisizioniFilter } from '../hooks/useAcquisizioniFilter';

const Acquisizioni = () => {
  const [selectedLinea, setSelectedLinea] = useState('');
  const [selectedPostazione, setSelectedPostazione] = useState('');

  // Use the hook to get API data
  const { loading, error, getLinee, getPostazioniForLinea } = useLineePostazioni();

  // Use the acquisizioni filter hook
  const { 
    data: acquisizioniData, 
    loading: acquisizioniLoading, 
    error: acquisizioniError 
  } = useAcquisizioniFilter(selectedLinea, selectedPostazione);

  // Get available linee and postazioni
  const linee = getLinee();
  const postazioni = selectedLinea ? getPostazioniForLinea(selectedLinea) : [];

  // Reset postazione when linea changes
  useEffect(() => {
    setSelectedPostazione('');
  }, [selectedLinea]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Acquisizioni</h1>
        </div>
        <p className="text-gray-600">Gestisci le acquisizioni del sistema</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-800">Filtri di Acquisizione</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Caricamento dati...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">Errore nel caricamento dei dati: {error}</span>
            </div>
          </div>
        )}

        {/* Dropdowns Container */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* First Dropdown - Linea di Produzione */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Linea di Produzione
              </label>
              <div className="relative">
                <select
                  value={selectedLinea}
                  onChange={(e) => setSelectedLinea(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer text-gray-900"
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
              {selectedLinea && (
                <p className="text-sm text-blue-600">
                  Linea selezionata: <span className="font-medium">{selectedLinea}</span>
                </p>
              )}
            </div>

            {/* Second Dropdown - Postazione */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Postazione
              </label>
              <div className="relative">
                <select
                  value={selectedPostazione}
                  onChange={(e) => setSelectedPostazione(e.target.value)}
                  disabled={!selectedLinea || postazioni.length === 0}
                  className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer text-gray-900 ${
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
              {selectedPostazione && (
                <p className="text-sm text-green-600">
                  Postazione selezionata: <span className="font-medium">{selectedPostazione}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Display selected values */}
        {(selectedLinea || selectedPostazione) && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Selezioni Correnti:</h3>
            <div className="flex flex-wrap gap-3">
              {selectedLinea && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Linea: {selectedLinea}
                </span>
              )}
              {selectedPostazione && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Postazione: {selectedPostazione}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reset button */}
        {(selectedLinea || selectedPostazione) && (
          <div className="mt-6">
            <button
              onClick={() => {
                setSelectedLinea('');
                setSelectedPostazione('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reimposta Filtri
            </button>
          </div>
        )}
      </div>

      {/* Acquisizioni Results Table */}
      {selectedLinea && selectedPostazione && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Risultati Acquisizioni - {selectedLinea} / {selectedPostazione}
            </h2>
          </div>

          {/* Loading state for acquisizioni */}
          {acquisizioniLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Caricamento acquisizioni...</span>
            </div>
          )}

          {/* Error state for acquisizioni */}
          {acquisizioniError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">Errore: {acquisizioniError}</span>
              </div>
            </div>
          )}

          {/* Results table */}
          {!acquisizioniLoading && !acquisizioniError && (
            <>
              {acquisizioniData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessuna acquisizione trovata per la combinazione selezionata.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Codice Articolo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Codice Ordine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Esito CQ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scostamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Inserimento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Foto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {acquisizioniData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.codicE_ARTICOLO}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.codicE_ORDINE}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.esitO_CQ_ARTICOLO 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.esitO_CQ_ARTICOLO ? 'Positivo' : 'Negativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.scostamentO_CQ_ARTICOLO}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {new Date(item.dT_INS).toLocaleString('it-IT')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex gap-2">
                              {item.fotO_SUPERIORE && (
                                <button
                                  onClick={() => window.open(`http://localhost:7052/foto/${encodeURIComponent(item.fotO_SUPERIORE)}`, '_blank')}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Foto Superiore"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              {item.fotO_FRONTALE && (
                                <button
                                  onClick={() => window.open(`http://localhost:7052/foto/${encodeURIComponent(item.fotO_FRONTALE)}`, '_blank')}
                                  className="text-green-600 hover:text-green-800"
                                  title="Foto Frontale"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Acquisizioni;
