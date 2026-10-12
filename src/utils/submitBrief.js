export async function submitBrief(message, consent) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, consent }),
      signal: AbortSignal.timeout(12000),
    });
    const result = await response.json();
    return response.ok && result.ok === true;
  } catch {
    return false;
  }
}
