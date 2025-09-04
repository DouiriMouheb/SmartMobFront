// Full update record
export async function updateDatabaseRecordFull(id, { descrizione, valore, codLineaProd, tipologia }) {
  const response = await fetch(`https://localhost:7052/api/DatabaseRecords/${id}/full`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descrizione, valore, codLineaProd, tipologia }),
  });
  if (!response.ok) throw new Error('Failed to update record');
  return response.json();
}

// Delete record by id
export async function deleteDatabaseRecord(id) {
  const response = await fetch(`https://localhost:7052/api/DatabaseRecords/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete record');
  return response.json();
}
// Service for API calls to /api/DatabaseRecords
export async function fetchDatabaseRecords() {
  const response = await fetch('https://localhost:7052/api/DatabaseRecords');
  if (!response.ok) throw new Error('Failed to fetch records');
  return response.json();
}

// Create new record
export async function createDatabaseRecord({ descrizione, valore, codLineaProd, tipologia }) {
  const response = await fetch('https://localhost:7052/api/DatabaseRecords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descrizione, valore, codLineaProd, tipologia }),
  });
  if (!response.ok) throw new Error('Failed to create record');
  return response.json();
}

export async function updateDatabaseRecord(id, value) {
  const response = await fetch(`https://localhost:7052/api/DatabaseRecords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valore: value }),
  });
  if (!response.ok) throw new Error('Failed to update record');
  return response.json();
}
