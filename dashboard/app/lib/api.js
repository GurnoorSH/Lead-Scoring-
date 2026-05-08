export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function formatDate(value) {
  if (!value) return 'Unknown';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function getStatus(score = 0) {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}
