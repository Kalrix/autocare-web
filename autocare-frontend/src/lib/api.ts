const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function fetchFromAPI<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`API Error (${response.status}) at ${url}:`, responseText);
      throw new Error(`API Error (${response.status}): ${responseText}`);
    }

    if (!responseText) return null as unknown as T;

    try {
      return JSON.parse(responseText) as T;
    } catch (jsonErr) {
      console.error(`JSON parsing failed for ${url}:`, jsonErr, responseText);
      throw new Error(`Invalid JSON response from ${url}`);
    }
  } catch (err) {
    console.error(`fetchFromAPI failed at ${url}:`, err);
    throw err;
  }
}
