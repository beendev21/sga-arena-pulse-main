export const formatApiTimestamp = (value?: string | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const formatApiUtcTimestamp = (value?: string | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
};

export const toDateTimeLocalValue = (value?: string | Date | null) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export const parseApiResponse = (r: any) => {
  if (!r) return [];
  if (Array.isArray(r)) return r;
  const list = r?.result;
  if (Array.isArray(list)) return list;
  return list?.$values || [];
};

export const extractEntity = (response: any) => {
  if (!response) return null;
  if (response.result && !Array.isArray(response.result)) return response.result;
  if (response.data && !Array.isArray(response.data)) return response.data;
  if (!Array.isArray(response) && response.id) return response;
  return null;
};

export const filt = (arr: any[], key: string, query: string) =>
  arr.filter((x) => String(x[key]).toLowerCase().includes(query.toLowerCase()));

export function paginate<T>(arr: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return { items: arr.slice(start, start + pageSize), pages: Math.max(1, Math.ceil(arr.length / pageSize)) };
}
