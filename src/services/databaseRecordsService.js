// Service for API calls to /api/DatabaseRecords
export async function fetchDatabaseRecords() {
  const response = await fetch('https://localhost:7052/api/DatabaseRecords');
  if (!response.ok) throw new Error('Failed to fetch records');
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
