export function unwrapList<T = any>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];
  if (Array.isArray(response?.data)) return response.data as T[];
  if (Array.isArray(response?.result)) return response.result as T[];
  if (Array.isArray(response?.result?.$values)) return response.result.$values as T[];
  if (Array.isArray(response?.$values)) return response.$values as T[];
  return [];
}

