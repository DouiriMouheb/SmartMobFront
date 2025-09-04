import React from 'react';
import ControlloQualitaTable from '../components/ControlloQualitaTable';
import { useControlloQualitaRecords } from '../hooks/useControlloQualitaRecords';

const ControlloQualita = () => {
  const { records, loading, error, updateRecord, refreshRecords } = useControlloQualitaRecords();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Controllo Qualità</h1>
      {loading && (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="text-yellow-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">API non disponibile</h3>
              <p className="text-sm text-yellow-700 mt-1">L'API per il Controllo Qualità non è ancora pronta. La tabella verrà caricata automaticamente quando l'API sarà disponibile.</p>
            </div>
          </div>
        </div>
      )}
      
      <ControlloQualitaTable data={records} updateRecord={updateRecord} refreshRecords={refreshRecords} />
    </div>
  );
};

export default ControlloQualita;
