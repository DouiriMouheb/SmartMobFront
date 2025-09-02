import Table from '../components/Table';
import { useDatabaseRecords } from '../hooks/useDatabaseRecords';


const TablePage = () => {
  const { records, loading, error, updateRecord } = useDatabaseRecords();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {loading && (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      
      <Table data={records} updateRecord={updateRecord} />
    </div>
  );
};

export default TablePage;
