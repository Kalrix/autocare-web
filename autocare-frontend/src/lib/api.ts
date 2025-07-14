const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function fetchFromAPI<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}) at ${path}:`, errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const text = await response.text();

    // Return null if empty response
    if (!text) return null as unknown as T;

    // Parse JSON response
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`fetchFromAPI failed at ${path}:`, error);
    throw error;
  }
}
