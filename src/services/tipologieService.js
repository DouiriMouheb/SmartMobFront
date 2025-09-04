export async function fetchTipologie() {
  const response = await fetch('https://localhost:7052/api/Tipologie');
  if (!response.ok) throw new Error('Failed to fetch tipologie');
  return response.json();
}
