const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchTipologie() {
  const response = await fetch(`${API_BASE_URL}/api/Tipologie`);
  if (!response.ok) throw new Error('Failed to fetch tipologie');
  return response.json();
}
