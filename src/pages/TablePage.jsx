import Table from '../components/Table';
import { useDatabaseRecords } from '../hooks/useDatabaseRecords';
import { Loader2, SlidersHorizontal } from 'lucide-react';


const TablePage = () => {
  const { records, loading, updateRecord, refreshRecords } = useDatabaseRecords();

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div className="app-page-title-row">
          <SlidersHorizontal className="h-7 w-7 text-red-700" />
          <h1 className="app-page-title">Impostazioni</h1>
        </div>
        <p className="app-page-subtitle">
          Gestione centralizzata dei record di configurazione.
        </p>
      </div>

      {loading && (
        <div className="app-surface flex items-center justify-center py-10">
          <Loader2 className="app-spinner" />
        </div>
      )}

      <Table data={records} updateRecord={updateRecord} refreshRecords={refreshRecords} />
    </div>
  );
};

export default TablePage;
