import React, { useState } from 'react';
import Modal from './Modal';
import { Pen } from 'lucide-react';



const Table = ({ data, updateRecord }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [saving, setSaving] = useState(false);

  const handleUpdateClick = (row) => {
    setSelectedRow(row);
    setNewValue(row.value);
    setModalOpen(true);
  };

    const handleSave = async () => {
        setSaving(true);
        let success = false;
        if (updateRecord && selectedRow) {
            try {
                const res = await updateRecord(selectedRow.id, newValue);
                // If updateRecord returns a success boolean or response, check it
                if (res && res.success !== false) {
                    success = true;
                }
            } catch {
                success = false;
            }
        }
        setSaving(false);
        if (success) setModalOpen(false);
    };

return (
    <>
        <table className="min-w-full border border-gray-200 shadow-lg rounded-lg overflow-hidden">
            <thead>
                <tr>
                    <th className="px-4 py-2 border-b text-center bg-gray-50">ID</th>
                    <th className="px-4 py-2 border-b text-left bg-gray-50">Description</th>
                    <th className="px-4 py-2 border-b text-center bg-gray-50">Date</th>
                    <th className="px-4 py-2 border-b text-center bg-gray-50">Valore</th>
                    <th className="px-4 py-2 border-b text-center bg-gray-50">Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr
                        key={idx}
                        className="transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:bg-red-50"
                        style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transform: 'perspective(600px) rotateX(0deg)',
                        }}
                    >
                        <td className="px-4 py-2 border-b text-center">{row.id}</td>
                        <td className="px-4 py-2 border-b text-left">{`${row.description}`}</td>
                        <td className="px-4 py-2 border-b text-center">{`${row.formattedDate}`}</td>
                        <td className="px-4 py-2 border-b text-left">{row.value}</td>
                        <td className="px-4 py-2 border-b text-center">
                            <button
                                className="px-2 py-1 bg-yellow-200 text-black rounded text-xs shadow transition-all duration-200 hover:bg-yellow-300 hover:scale-110 hover:shadow-lg"
                                onClick={() => handleUpdateClick(row)}
                                style={{
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                }}
                            >
                                <Pen size={16} className="inline-block" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Update File Path">
            {selectedRow && (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSave();
                    }}
                    className="flex flex-col gap-4"
                >
                    <label className="font-semibold">New File Path:</label>
                    <input
                        className="border px-2 py-1 rounded"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                        <button type="button" className="px-3 py-1 bg-gray-300 rounded" onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1 bg-blue-500 text-white rounded flex items-center justify-center"
                                                    disabled={saving}
                                                >
                                                    {saving ? (
                                                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                                        </svg>
                                                    ) : null}
                                                    Save
                                                </button>
                    </div>
                </form>
            )}
        </Modal>
    </>
);
};

export default Table;
