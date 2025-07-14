// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function fetchFromAPI<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error (${res.status}) at ${path}:`, errorText);
      throw new Error(`API Error (${res.status}): ${errorText}`);
    }

    const text = await res.text();
    if (!text) return null as unknown as T;
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`fetchFromAPI failed at ${path}:`, error);
    throw error;
  }
}
