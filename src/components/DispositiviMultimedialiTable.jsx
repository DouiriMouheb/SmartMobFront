import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Modal from './Modal';
import { createDispositiviMultimedialiRecord, updateDispositiviMultimedialiRecord, deleteDispositiviMultimedialiRecord } from '../services/dispositiviMultimedialiService';
import { showSuccess, showError } from '../services/toastService';

const DispositiviMultimedialiTable = ({ data, updateRecord, refreshRecords }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [createMode, setCreateMode] = useState(false);
    const [form, setForm] = useState({ 
        codLineaProd: '', 
        codPostazione: '', 
        serialeDispositivo: '', 
        pathStorageDispositivo: '', 
        pathDestinazioneSpostamento: '' 
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [recordsPerPage, setRecordsPerPage] = useState(10);

    // Utility function to format dates as day/month/year hour:minute:second
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    // Filter and sort data
    const filteredData = useMemo(() => {
        let filtered = data || [];
        
        // Apply search filter
        if (searchTerm.trim() && filtered.length > 0) {
            filtered = filtered.filter(row => {
                const formattedDtIns = formatDate(row.dtIns);
                const formattedDtAgg = formatDate(row.dtAgg);
                
                return (
                    row.codLineaProd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.codPostazione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.serialeDispositivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.pathStorageDispositivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    row.pathDestinazioneSpostamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    formattedDtIns.includes(searchTerm) ||
                    formattedDtAgg.includes(searchTerm)
                );
            });
        }
        
        // Apply sorting
        if (sortField && filtered.length > 0) {
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;
                
                switch (sortField) {
                    case 'codLineaProd':
                        aValue = a.codLineaProd?.toLowerCase() || '';
                        bValue = b.codLineaProd?.toLowerCase() || '';
                        break;
                    case 'codPostazione':
                        aValue = a.codPostazione?.toLowerCase() || '';
                        bValue = b.codPostazione?.toLowerCase() || '';
                        break;
                    case 'serialeDispositivo':
                        aValue = a.serialeDispositivo?.toLowerCase() || '';
                        bValue = b.serialeDispositivo?.toLowerCase() || '';
                        break;
                    case 'dtIns':
                        aValue = new Date(a.dtIns);
                        bValue = new Date(b.dtIns);
                        break;
                    case 'dtAgg':
                        aValue = new Date(a.dtAgg);
                        bValue = new Date(b.dtAgg);
                        break;
                    default:
                        return 0;
                }
                
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [data, searchTerm, sortField, sortDirection]);

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [];
        }
        if (recordsPerPage === 'all') {
            return filteredData;
        }
        const startIndex = (currentPage - 1) * recordsPerPage;
        return filteredData.slice(startIndex, startIndex + recordsPerPage);
    }, [filteredData, currentPage, recordsPerPage]);

    const totalPages = recordsPerPage === 'all' ? 1 : Math.ceil((filteredData?.length || 0) / recordsPerPage);

    // Handle search
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Handle records per page change
    const handleRecordsPerPageChange = (newRecordsPerPage) => {
        setRecordsPerPage(newRecordsPerPage);
        setCurrentPage(1);
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Sortable header component
    const SortableHeader = ({ field, children, className = "" }) => (
        <th 
            className={`px-4 py-2 border-b-2 border-gray-300 cursor-pointer hover:bg-gray-50 ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center justify-center gap-1">
                {children}
                {sortField === field && (
                    <span className="text-red-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                )}
            </div>
        </th>
    );

    // Modal handlers
    const handleRowClick = (row) => {
        setSelectedRow(row);
        setForm({ 
            codLineaProd: row.codLineaProd || '', 
            codPostazione: row.codPostazione || '',
            serialeDispositivo: row.serialeDispositivo || '',
            pathStorageDispositivo: row.pathStorageDispositivo || '',
            pathDestinazioneSpostamento: row.pathDestinazioneSpostamento || ''
        });
        setEditMode(false);
        setCreateMode(false);
        setModalOpen(true);
    };

    const handleEditClick = () => {
        setEditMode(true);
        setCreateMode(false);
    };

    const handleCreateClick = () => {
        setCreateMode(true);
        setEditMode(false);
        setSelectedRow(null);
        setForm({ 
            codLineaProd: '', 
            codPostazione: '', 
            serialeDispositivo: '', 
            pathStorageDispositivo: '', 
            pathDestinazioneSpostamento: '' 
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditMode(false);
        setCreateMode(false);
        setSelectedRow(null);
        setForm({ 
            codLineaProd: '', 
            codPostazione: '', 
            serialeDispositivo: '', 
            pathStorageDispositivo: '', 
            pathDestinazioneSpostamento: '' 
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let res;
            if (createMode) {
                res = await createDispositiviMultimedialiRecord(form);
            } else {
                res = await updateDispositiviMultimedialiRecord(selectedRow.id, form);
            }

            if (res.success) {
                showSuccess(res.message || (createMode ? 'Record creato' : 'Record aggiornato'));
                handleCloseModal();
                if (refreshRecords) await refreshRecords();
            } else {
                showError(res.message || 'Operazione fallita');
            }
        } catch (err) {
            showError('Operazione fallita');
        }
        setSaving(false);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await deleteDispositiviMultimedialiRecord(selectedRow.id);
            if (res.success) {
                showSuccess(res.message || 'Record eliminato');
                handleCloseModal();
                if (refreshRecords) await refreshRecords();
            } else {
                showError(res.message || 'Eliminazione fallita');
            }
        } catch (err) {
            showError('Eliminazione fallita');
        }
        setDeleting(false);
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const getModalFooter = () => {
        if (createMode || editMode) {
            const isFormValid = form.codLineaProd.trim() !== '' && 
                               form.codLineaProd.trim().length <= 50 &&
                               form.codPostazione.trim() !== '' && 
                               form.codPostazione.trim().length <= 50 &&
                               form.serialeDispositivo.trim() !== '' && 
                               form.serialeDispositivo.trim().length <= 100 &&
                               form.pathStorageDispositivo.trim() !== '' && 
                               form.pathStorageDispositivo.trim().length <= 500 &&
                               form.pathDestinazioneSpostamento.trim() !== '' && 
                               form.pathDestinazioneSpostamento.trim().length <= 500;
            
            return (
                <>
                    <button 
                        type="button" 
                        className="px-3 py-1 bg-gray-300 rounded" 
                        onClick={handleCloseModal}
                        disabled={saving}
                    >
                        Annulla
                    </button>
                    <button
                        type="button"
                        className={`px-3 py-1 rounded flex items-center ${
                            isFormValid 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!isFormValid || saving}
                        onClick={handleSave}
                    >
                        {saving ? (
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        ) : null}
                        Salva
                    </button>
                </>
            );
        }
        
        return (
            <>
             
                <button
                    type="button"
                    className="px-3 py-1 bg-blue-500 text-white rounded flex items-center"
                    onClick={handleEditClick}
                >
                    <Edit size={16} className="mr-1" />
                    Modifica
                </button>
                <button
                    type="button"
                    className="px-3 py-1 bg-red-600 text-white rounded flex items-center"
                    onClick={handleDeleteClick}
                >
                    <Trash2 size={16} className="mr-1" />
                    Elimina
                </button>
                   <button 
                    type="button" 
                    className="px-3 py-1 bg-gray-300 rounded" 
                    onClick={handleCloseModal}
                >
                    Chiudi
                </button>
            </>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header with search and create button */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Cerca per codice, seriale, path o data..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuovo Record
                    </button>
                </div>

                {/* Table */}
                <table className="w-full">
                    <thead className="bg-gray-400">
                        <tr>
                            <SortableHeader field="codLineaProd" className="text-center">
                                Cod. Linea Prod
                            </SortableHeader>
                            <SortableHeader field="codPostazione" className="text-center">
                                Cod. Postazione
                            </SortableHeader>
                            <SortableHeader field="serialeDispositivo" className="text-center">
                                Seriale Dispositivo
                            </SortableHeader>
                            <SortableHeader field="dtIns" className="text-center">
                                Data Inserimento
                            </SortableHeader>
                            <SortableHeader field="dtAgg" className="text-center">
                                Data Aggiornamento
                            </SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                    {filteredData.length === 0 && data?.length > 0 
                                        ? 'Nessun record trovato con i criteri di ricerca.' 
                                        : 'Nessun record disponibile.'
                                    }
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleRowClick(row)}
                                >
                                    <td className="px-4 py-2 border-b text-center">
                                        <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                                            {row.codLineaProd}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-b text-center">
                                        <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                                            {row.codPostazione}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-b text-center">
                                        <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                                            {row.serialeDispositivo}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-b text-center">
                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm font-medium">
                                            {formatDate(row.dtIns)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-b text-center">
                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm font-medium">
                                            {formatDate(row.dtAgg)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="mt-4 flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {recordsPerPage === 'all' 
                                    ? `Mostrando tutti i ${filteredData.length} record` 
                                    : `Pagina ${currentPage} di ${totalPages} - Mostrando ${paginatedData.length} di ${filteredData.length} record`
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Record per pagina:</span>
                                <select 
                                    value={recordsPerPage} 
                                    onChange={(e) => handleRecordsPerPageChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value="all">Tutti</option>
                                </select>
                            </div>
                        </div>
                        {recordsPerPage !== 'all' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded flex items-center gap-1 ${
                                        currentPage === 1 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                >
                                    <ChevronLeft size={16} />
                                    Precedente
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded ${
                                                currentPage === page 
                                                    ? 'bg-red-500 text-white' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded flex items-center gap-1 ${
                                        currentPage === totalPages 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                >
                                    Successiva
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Modal */}
            <Modal 
                open={modalOpen} 
                title={createMode ? "Nuovo Record" : (editMode ? "Modifica Record" : "Dettagli Record")}
                footer={getModalFooter()}
            >
                {createMode && (
                    <div className="flex flex-col gap-4">
                        {/* Cod. Linea Prod */}
                        <div>
                            <label className="font-semibold block mb-1">Cod. Linea Prod: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.codLineaProd}
                                onChange={(e) => setForm(prev => ({ ...prev, codLineaProd: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.codLineaProd.length > 50 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Inserisci codice linea produzione"
                                maxLength={50}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.codLineaProd.length}/50 caratteri
                                {form.codLineaProd.length > 50 && (
                                    <span className="text-red-500 ml-2">Massimo 50 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Cod. Postazione */}
                        <div>
                            <label className="font-semibold block mb-1">Cod. Postazione: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.codPostazione}
                                onChange={(e) => setForm(prev => ({ ...prev, codPostazione: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.codPostazione.length > 50 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Inserisci codice postazione"
                                maxLength={50}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.codPostazione.length}/50 caratteri
                                {form.codPostazione.length > 50 && (
                                    <span className="text-red-500 ml-2">Massimo 50 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Seriale Dispositivo */}
                        <div>
                            <label className="font-semibold block mb-1">Seriale Dispositivo: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.serialeDispositivo}
                                onChange={(e) => setForm(prev => ({ ...prev, serialeDispositivo: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.serialeDispositivo.length > 100 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Inserisci seriale dispositivo"
                                maxLength={100}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.serialeDispositivo.length}/100 caratteri
                                {form.serialeDispositivo.length > 100 && (
                                    <span className="text-red-500 ml-2">Massimo 100 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Path Storage Dispositivo */}
                        <div>
                            <label className="font-semibold block mb-1">Path Storage Dispositivo: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.pathStorageDispositivo}
                                onChange={(e) => setForm(prev => ({ ...prev, pathStorageDispositivo: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.pathStorageDispositivo.length > 500 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Inserisci path storage dispositivo"
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.pathStorageDispositivo.length}/500 caratteri
                                {form.pathStorageDispositivo.length > 500 && (
                                    <span className="text-red-500 ml-2">Massimo 500 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Path Destinazione Spostamento */}
                        <div>
                            <label className="font-semibold block mb-1">Path Destinazione Spostamento: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.pathDestinazioneSpostamento}
                                onChange={(e) => setForm(prev => ({ ...prev, pathDestinazioneSpostamento: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.pathDestinazioneSpostamento.length > 500 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Inserisci path destinazione spostamento"
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.pathDestinazioneSpostamento.length}/500 caratteri
                                {form.pathDestinazioneSpostamento.length > 500 && (
                                    <span className="text-red-500 ml-2">Massimo 500 caratteri</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {editMode && (
                    <div className="flex flex-col gap-4">
                        {/* Cod. Linea Prod */}
                        <div>
                            <label className="font-semibold block mb-1">Cod. Linea Prod: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.codLineaProd}
                                onChange={(e) => setForm(prev => ({ ...prev, codLineaProd: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.codLineaProd.length > 50 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                maxLength={50}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.codLineaProd.length}/50 caratteri
                                {form.codLineaProd.length > 50 && (
                                    <span className="text-red-500 ml-2">Massimo 50 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Cod. Postazione */}
                        <div>
                            <label className="font-semibold block mb-1">Cod. Postazione: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.codPostazione}
                                onChange={(e) => setForm(prev => ({ ...prev, codPostazione: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.codPostazione.length > 50 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                maxLength={50}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.codPostazione.length}/50 caratteri
                                {form.codPostazione.length > 50 && (
                                    <span className="text-red-500 ml-2">Massimo 50 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Seriale Dispositivo */}
                        <div>
                            <label className="font-semibold block mb-1">Seriale Dispositivo: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.serialeDispositivo}
                                onChange={(e) => setForm(prev => ({ ...prev, serialeDispositivo: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.serialeDispositivo.length > 100 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                maxLength={100}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.serialeDispositivo.length}/100 caratteri
                                {form.serialeDispositivo.length > 100 && (
                                    <span className="text-red-500 ml-2">Massimo 100 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Path Storage Dispositivo */}
                        <div>
                            <label className="font-semibold block mb-1">Path Storage Dispositivo: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.pathStorageDispositivo}
                                onChange={(e) => setForm(prev => ({ ...prev, pathStorageDispositivo: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.pathStorageDispositivo.length > 500 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.pathStorageDispositivo.length}/500 caratteri
                                {form.pathStorageDispositivo.length > 500 && (
                                    <span className="text-red-500 ml-2">Massimo 500 caratteri</span>
                                )}
                            </div>
                        </div>

                        {/* Path Destinazione Spostamento */}
                        <div>
                            <label className="font-semibold block mb-1">Path Destinazione Spostamento: <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.pathDestinazioneSpostamento}
                                onChange={(e) => setForm(prev => ({ ...prev, pathDestinazioneSpostamento: e.target.value }))}
                                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    form.pathDestinazioneSpostamento.length > 500 ? 'border-red-500' : 'border-gray-300'
                                }`}
                                maxLength={500}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {form.pathDestinazioneSpostamento.length}/500 caratteri
                                {form.pathDestinazioneSpostamento.length > 500 && (
                                    <span className="text-red-500 ml-2">Massimo 500 caratteri</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!createMode && !editMode && selectedRow && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold block mb-1">ID:</label>
                                <p className="p-2 bg-gray-50 rounded border">{selectedRow.id}</p>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Cod. Linea Prod:</label>
                                <p className="p-2 bg-gray-50 rounded border">{selectedRow.codLineaProd}</p>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Cod. Postazione:</label>
                                <p className="p-2 bg-gray-50 rounded border">{selectedRow.codPostazione}</p>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Seriale Dispositivo:</label>
                                <p className="p-2 bg-gray-50 rounded border">{selectedRow.serialeDispositivo}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="font-semibold block mb-1">Path Storage Dispositivo:</label>
                                <p className="p-2 bg-gray-50 rounded border break-all">{selectedRow.pathStorageDispositivo}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="font-semibold block mb-1">Path Destinazione Spostamento:</label>
                                <p className="p-2 bg-gray-50 rounded border break-all">{selectedRow.pathDestinazioneSpostamento}</p>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Data Inserimento:</label>
                                <p className="p-2 bg-gray-50 rounded border">{formatDate(selectedRow.dtIns)}</p>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Data Aggiornamento:</label>
                                <p className="p-2 bg-gray-50 rounded border">{formatDate(selectedRow.dtAgg)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                open={showDeleteConfirm} 
                title="Conferma Eliminazione"
                footer={
                    <>
                        <button 
                            type="button" 
                            className="px-3 py-1 bg-gray-300 rounded" 
                            onClick={handleCancelDelete}
                            disabled={deleting}
                        >
                            Annulla
                        </button>
                        <button
                            type="button"
                            className="px-3 py-1 bg-red-500 text-white rounded flex items-center"
                            disabled={deleting}
                            onClick={handleConfirmDelete}
                        >
                            {deleting ? (
                                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                            ) : <Trash2 size={16} className="mr-1" />}
                            Elimina
                        </button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <p className="text-lg mb-2">Sei sicuro di voler eliminare questo record?</p>
                    <p className="text-gray-600">Questa azione non può essere annullata.</p>
                </div>
            </Modal>
        </>
    );
};

export default DispositiviMultimedialiTable;
