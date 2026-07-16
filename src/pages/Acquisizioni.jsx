import React, { useState, useEffect } from 'react';
import { Database, ChevronDown, Loader2, AlertCircle, Package, ChevronLeft, ChevronRight, Search, X, FileBox, Newspaper } from 'lucide-react';
import { useLineePostazioni } from '../hooks/useLineePostazioni';
import { useAcquisizioniFilter } from '../hooks/useAcquisizioniFilter';
import Modal from '../components/Modal';
import acquisizioniService from '../services/acquisizioniService';
import { showError } from '../services/toastService';

const Acquisizioni = () => {
  const [selectedLinea, setSelectedLinea] = useState('');
  const [selectedPostazione, setSelectedPostazione] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const [reviewState, setReviewState] = useState({});
  const [reviewBase, setReviewBase] = useState({});
  const [savingReview, setSavingReview] = useState({});

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAcquisizione, setSelectedAcquisizione] = useState(null);

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLinea, selectedPostazione, itemsPerPage, searchTerm]);

  useEffect(() => {
    setReviewState({});
    setReviewBase({});
    setSavingReview({});
  }, [selectedLinea, selectedPostazione]);

  useEffect(() => {
    setReviewBase(() => {
      const next = {};

      acquisizioniData.forEach((item) => {
        next[item.id] = {
          checkedByUser: item.checkedByUser ?? null,
          userNotes: item.userNotes ?? '',
        };
      });

      return next;
    });
  }, [acquisizioniData]);

  const getEsitoLabel = (esito) => {
    if (esito === null || esito === undefined || esito === '') {
      return '-';
    }

    // 0 => positivo, 1 => negativo
    return Number(esito) === 0 ? 'OK' : 'KO';
  };

  const getEsitoBadgeClasses = (esito, mobile = false) => {
    if (esito === null || esito === undefined || esito === '') {
      return mobile ? 'bg-gray-400 text-white shadow-sm' : 'bg-gray-100 text-gray-500';
    }

    // 0 => positivo (verde), 1 => negativo (rosso)
    if (Number(esito) === 0) {
      return mobile ? 'bg-green-500 text-white shadow-sm' : 'bg-green-100 text-green-800';
    }

    return mobile ? 'bg-red-500 text-white shadow-sm' : 'bg-red-100 text-red-800';
  };

  const formatEsitoLabel = (esito) => {
    const label = getEsitoLabel(esito);
    if (label === '-') {
      return '-';
    }
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
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

  const getPhotoValue = (item, field) => {
    if (!item) {
      return null;
    }

    if (field === 'superiore') {
      return item.fotoSuperiore ?? item.fotO_SUPERIORE ?? null;
    }

    if (field === 'frontale') {
      return item.fotoFrontale ?? item.fotO_FRONTALE ?? null;
    }

    return null;
  };

  const handleOpenDetails = (item) => {
    setSelectedAcquisizione(item);
    setDetailsOpen(true);
  };

  const getReviewLabel = (value) => {
    if (value === true) {
      return 'approvato';
    }

    if (value === false) {
      return 'non approvato';
    }

    return 'non verificato';
  };

  const reviewOptions = [
    { value: true, label: 'Si', activeClass: 'bg-green-600 text-white' },
    { value: null, label: '-', activeClass: 'bg-gray-400 text-white' },
    { value: false, label: 'No', activeClass: 'bg-red-600 text-white' },
  ];

  const getReviewField = (itemId, field, fallback) => {
    if (reviewState[itemId] && Object.prototype.hasOwnProperty.call(reviewState[itemId], field)) {
      return reviewState[itemId][field];
    }

    if (reviewBase[itemId] && Object.prototype.hasOwnProperty.call(reviewBase[itemId], field)) {
      return reviewBase[itemId][field];
    }

    return fallback;
  };

  const getCheckedByUser = (item) => (
    getReviewField(item.id, 'checkedByUser', item.checkedByUser ?? null)
  );

  const getUserNotes = (item) => (
    getReviewField(item.id, 'userNotes', item.userNotes ?? '')
  );

  const setReviewField = (itemId, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleUserReviewSave = async (item, updates = {}) => {
    const hasCheckedUpdate = Object.prototype.hasOwnProperty.call(updates, 'checkedByUser');
    const hasNotesUpdate = Object.prototype.hasOwnProperty.call(updates, 'userNotes');

    const nextCheckedByUser = hasCheckedUpdate
      ? updates.checkedByUser
      : getReviewField(item.id, 'checkedByUser', item.checkedByUser ?? null);

    const nextUserNotes = hasNotesUpdate
      ? updates.userNotes
      : getReviewField(item.id, 'userNotes', item.userNotes ?? '');

    const base = reviewBase[item.id] || {
      checkedByUser: item.checkedByUser ?? null,
      userNotes: item.userNotes ?? '',
    };

    if (base.checkedByUser === nextCheckedByUser && base.userNotes === nextUserNotes) {
      return;
    }

    setSavingReview((prev) => ({ ...prev, [item.id]: true }));
    setReviewState((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        checkedByUser: nextCheckedByUser,
        userNotes: nextUserNotes,
      },
    }));

    const result = await acquisizioniService.updateUserReview(item.id, {
      checkedByUser: nextCheckedByUser,
      userNotes: nextUserNotes,
    });

    setSavingReview((prev) => ({ ...prev, [item.id]: false }));

    if (!result.success) {
      showError(result.message || 'Errore aggiornamento revisione utente');
      setReviewState((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      return;
    }

    setReviewBase((prev) => ({
      ...prev,
      [item.id]: {
        checkedByUser: nextCheckedByUser,
        userNotes: nextUserNotes,
      },
    }));
    setReviewState((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  const handleCloseDetails = () => {
    if (selectedAcquisizione && !savingReview[selectedAcquisizione.id]) {
      handleUserReviewSave(selectedAcquisizione, {
        checkedByUser: getCheckedByUser(selectedAcquisizione),
        userNotes: getUserNotes(selectedAcquisizione),
      });
    }

    setDetailsOpen(false);
    setSelectedAcquisizione(null);
  };

  const selectedFotoSuperiore = selectedAcquisizione
    ? getPhotoValue(selectedAcquisizione, 'superiore')
    : null;
  const selectedFotoFrontale = selectedAcquisizione
    ? getPhotoValue(selectedAcquisizione, 'frontale')
    : null;

  const renderReviewToggle = (item) => {
    const checkedByUser = getCheckedByUser(item);
    const isSaving = Boolean(savingReview[item.id]);

    return (
      <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
        {reviewOptions.map((option, index) => {
          const isActive = option.value === checkedByUser
            || (option.value === null && (checkedByUser === null || checkedByUser === undefined));
          const activeClass = option.activeClass;
          const inactiveClass = 'text-gray-600 hover:bg-gray-50';
          const separator = index < reviewOptions.length - 1 ? 'border-r border-gray-300' : '';

          return (
            <button
              key={option.label}
              type="button"
              className={`px-2 py-1 text-xs font-medium transition ${separator} ${isActive ? activeClass : inactiveClass} ${isSaving ? 'cursor-not-allowed opacity-60' : ''}`}
              onClick={() => handleUserReviewSave(item, { checkedByUser: option.value })}
              aria-pressed={isActive}
              aria-label={`Approvazione utente: ${option.label === '-' ? 'Non verificato' : option.label}`}
              title={option.label === '-' ? 'Non verificato' : option.label}
              disabled={isSaving}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  // Filter data based on search term
  const filteredData = acquisizioniData.filter(item => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      item.id?.toString().toLowerCase().includes(searchLower) ||
      item.codicE_ARTICOLO?.toLowerCase().includes(searchLower) ||
      item.codicE_ORDINE?.toLowerCase().includes(searchLower) ||
      getEsitoLabel(item.esitO_CQ_ARTICOLO).includes(searchLower) ||
      item.scostamentO_CQ_ARTICOLO?.toString().includes(searchLower) ||
      formatDifferentValue(item.rightSideAngleDifferent).toLowerCase().includes(searchLower) ||
      formatDifferentValue(item.rightSideMisalignmentDifferent).toLowerCase().includes(searchLower) ||
      formatDifferentValue(item.leftSideAngleDifferent).toLowerCase().includes(searchLower) ||
      formatDifferentValue(item.leftSideMisalignmentDifferent).toLowerCase().includes(searchLower) ||
      getReviewLabel(item.checkedByUser).includes(searchLower) ||
      item.userNotes?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination with filtered data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <>
    <div className="app-page">
      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-title-row">
          <Database className="w-6 h-6 sm:w-8 sm:h-8 text-red-700" />
          <h1 className="app-page-title">Acquisizioni</h1>
        </div>
        <p className="app-page-subtitle">Gestisci le acquisizioni del sistema</p>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="app-spinner" />
            <span className="ml-2 text-gray-600">Caricamento dati...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="app-alert-error mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">Errore nel caricamento dei dati: {error}</span>
            </div>
          </div>
        )}

        {/* Dropdowns Container */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-4xl">
            {/* First Dropdown - Linea di Produzione */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Linea di Produzione
              </label>
              <div className="relative group">
                <select
                  value={selectedLinea}
                  onChange={(e) => setSelectedLinea(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 appearance-none cursor-pointer text-gray-900 transition-all duration-200 hover:border-gray-300 group-hover:shadow-md text-sm sm:text-base"
                >
                  <option value="">Seleziona una linea...</option>
                  {linee.map((linea) => (
                    <option key={linea.value} value={linea.value}>
                      {linea.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none transition-transform group-hover:text-red-500" />
              </div>

            </div>

            {/* Second Dropdown - Postazione */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postazione
              </label>
              <div className="relative group">
                <select
                  value={selectedPostazione}
                  onChange={(e) => setSelectedPostazione(e.target.value)}
                  disabled={!selectedLinea || postazioni.length === 0}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 appearance-none cursor-pointer text-gray-900 transition-all duration-200 text-sm sm:text-base ${!selectedLinea || postazioni.length === 0
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                    : 'border-gray-200 hover:border-gray-300 group-hover:shadow-md'
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
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none transition-transform ${!selectedLinea || postazioni.length === 0
                  ? 'text-gray-300'
                  : 'text-gray-400 group-hover:text-red-500'
                  }`} />
              </div>

            </div>
          </div>
        )}



      </div>

      {/* Acquisizioni Results Table */}
      {selectedLinea && selectedPostazione && (
        <div className="app-surface mt-2 sm:mt-6 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-red-700" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Risultati Acquisizioni
            </h2>
          </div>

          {/* Loading state for acquisizioni */}
          {acquisizioniLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-red-700" />
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
                <>
                  {/* Search Bar - Fixed at Top */}
                  <div className="mb-4 sm:mb-6">
                    <div className="relative w-full sm:max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cerca in tutti i campi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items per page selector and total count - Fixed at Top */}
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                          Per pagina:
                        </label>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-red-400 focus:border-red-400 bg-white"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                        </select>

                        <div className="text-xs text-gray-600 font-medium text-center sm:text-right">
                          Totale: {totalItems}
                          {searchTerm && totalItems !== acquisizioniData.length && (
                            <span className="text-red-700 ml-1">(filtrati)</span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex flex-col h-[calc(100vh-400px)] min-h-[400px]">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto flex-1">
                      <div className="overflow-y-auto h-full">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
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
                                Data Inserimento
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rotazione Destra
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Disallineamento Destro
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rotazione Sinistra
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Disallineamento Sinistro
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenDetails(item)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.codicE_ARTICOLO}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.codicE_ORDINE}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEsitoBadgeClasses(item.esitO_CQ_ARTICOLO)}`}>
                                    {formatEsitoLabel(item.esitO_CQ_ARTICOLO)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDateTime(item.dT_INS)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDifferentValue(item.rightSideAngleDifferent)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDifferentValue(item.rightSideMisalignmentDifferent)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDifferentValue(item.leftSideAngleDifferent)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDifferentValue(item.leftSideMisalignmentDifferent)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View - Scrollable Container */}
                    <div className="md:hidden flex-1 overflow-y-auto px-1">
                      <div className="space-y-3 pb-4">
                        {currentItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => handleOpenDetails(item)}
                          >
                            {/* Status Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-t-lg border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${getEsitoBadgeClasses(item.esitO_CQ_ARTICOLO, true)}`}>
                                  {item.esitO_CQ_ARTICOLO === null || item.esitO_CQ_ARTICOLO === undefined
                                    ? '• -'
                                    : Number(item.esitO_CQ_ARTICOLO) === 0
                                      ? '✓ Positivo'
                                      : '✗ Negativo'}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatDateTime(item.dT_INS)}
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                              {/* Side Difference Values */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Rotazione Destra</p>
                                  <p className="text-sm font-semibold text-gray-800">{formatDifferentValue(item.rightSideAngleDifferent)}</p>
                                </div>

                                <div className="py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Disallineamento Destro</p>
                                  <p className="text-sm font-semibold text-gray-800">{formatDifferentValue(item.rightSideMisalignmentDifferent)}</p>
                                </div>

                                <div className="py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Rotazione Sinistra</p>
                                  <p className="text-sm font-semibold text-gray-800">{formatDifferentValue(item.leftSideAngleDifferent)}</p>
                                </div>

                                <div className="py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Disallineamento Sinistro</p>
                                  <p className="text-sm font-semibold text-gray-800">{formatDifferentValue(item.leftSideMisalignmentDifferent)}</p>
                                </div>
                              </div>

                              {/* Order Information */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center text-slate-700">
                                    <Newspaper className="h-4 w-4 mr-2" />
                                    <span className="text-xs text-slate-600 font-medium uppercase tracking-wide">Ordine</span>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-800 font-mono">
                                    {item.codicE_ORDINE}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-100">
                                  <div className="flex items-center text-red-700">
                                    <FileBox className="h-4 w-4 mr-2" />
                                    <span className="text-xs text-red-600 font-medium uppercase tracking-wide">Articolo</span>
                                  </div>
                                  <span className="text-sm font-semibold text-red-800 font-mono">
                                    {item.codicE_ARTICOLO}
                                  </span>
                                </div>
                              </div>

                            </div>
                          </div>
                        ))}

                        {/* Empty State inside scrollable area */}
                        {currentItems.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="mb-2">
                              {searchTerm
                                ? `Nessuna acquisizione corrisponde alla ricerca "${searchTerm}"`
                                : "Nessuna acquisizione trovata per la combinazione selezionata."
                              }
                            </p>
                            {searchTerm && (
                              <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm"
                              >
                                Cancella Ricerca
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pagination Controls - Fixed at Bottom */}
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 shadow-sm'
                          }`}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Prec</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                          let page;
                          if (totalPages <= 3) {
                            page = i + 1;
                          } else if (currentPage <= 2) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            page = totalPages - 2 + i;
                          } else {
                            page = currentPage - 1 + i;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === page
                                ? 'bg-red-700 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {totalPages > 3 && currentPage < totalPages - 1 && (
                          <>
                            <span className="px-1 text-gray-400 text-xs">•••</span>
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className="w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 shadow-sm'
                          }`}
                      >
                        <span className="hidden xs:inline">Succ</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-600 font-medium bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-center sm:text-left">
                      <span className="sm:hidden">
                        {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalItems)} di {totalItems}
                      </span>
                      <span className="hidden sm:inline">
                       Mostrando {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalItems)} di {totalItems} elementi
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
    <Modal
      open={detailsOpen}
      title={selectedAcquisizione ? `Dettagli acquisizione #${selectedAcquisizione.id}` : 'Dettagli acquisizione'}
      onBackdropClick={handleCloseDetails}
      size="2xl"
      className="max-w-5xl w-[95vw]"
      footer={(
        <button
          type="button"
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
          onClick={handleCloseDetails}
        >
          Chiudi
        </button>
      )}
    >
      {selectedAcquisizione && (
        <div className="space-y-5">
          {/* Informazioni generali */}
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Informazioni generali</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {selectedAcquisizione.id}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Codice Articolo</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                  {selectedAcquisizione.codicE_ARTICOLO || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Codice Ordine</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
                  {selectedAcquisizione.codicE_ORDINE || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Linea</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDifferentValue(selectedAcquisizione.coD_LINEA)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Postazione</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDifferentValue(selectedAcquisizione.coD_POSTAZIONE)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Esito CQ</p>
                <div className="mt-1 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getEsitoBadgeClasses(selectedAcquisizione.esitO_CQ_ARTICOLO)}`}>
                    {formatEsitoLabel(selectedAcquisizione.esitO_CQ_ARTICOLO)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Misurazioni */}
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Misurazioni</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rotazione Destra</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDifferentValue(selectedAcquisizione.rightSideAngleDifferent)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Disallineamento Destro</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDifferentValue(selectedAcquisizione.rightSideMisalignmentDifferent)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rotazione Sinistra</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDifferentValue(selectedAcquisizione.leftSideAngleDifferent)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Disallineamento Sinistro</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDifferentValue(selectedAcquisizione.leftSideMisalignmentDifferent)}
                </div>
              </div>
            </div>
          </section>

          {/* Foto */}
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Foto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Foto Superiore</p>
                {selectedFotoSuperiore ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img
                      src={selectedFotoSuperiore}
                      alt="Foto superiore"
                      className="h-52 w-full object-contain bg-gray-100"
                    />
                    <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-600 break-all">
                      {selectedFotoSuperiore}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-6 text-sm text-gray-500 text-center">
                    Nessuna immagine disponibile
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Foto Frontale</p>
                {selectedFotoFrontale ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img
                      src={selectedFotoFrontale}
                      alt="Foto frontale"
                      className="h-52 w-full object-contain bg-gray-100"
                    />
                    <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-600 break-all">
                      {selectedFotoFrontale}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-6 text-sm text-gray-500 text-center">
                    Nessuna immagine disponibile
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Date */}
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Date</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Inserimento</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDateTime(selectedAcquisizione.dT_INS)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Aggiornamento</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                  {formatDateTime(selectedAcquisizione.dT_AGG)}
                </div>
              </div>
            </div>
          </section>

          {/* Revisione Utente */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Revisione Utente
              </span>
              {renderReviewToggle(selectedAcquisizione)}
            </div>
            <textarea
              value={getUserNotes(selectedAcquisizione)}
              onChange={(e) => setReviewField(selectedAcquisizione.id, 'userNotes', e.target.value)}
              onBlur={(e) => handleUserReviewSave(selectedAcquisizione, { userNotes: e.target.value })}
              className="w-full min-h-[96px] resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:ring-1 focus:ring-red-300"
              placeholder="Aggiungi una nota per questa acquisizione..."
              aria-label="Note utente"
              disabled={Boolean(savingReview[selectedAcquisizione.id])}
            />
          </div>
        </div>
      )}
    </Modal>
    </>
  );
};

export default Acquisizioni;
