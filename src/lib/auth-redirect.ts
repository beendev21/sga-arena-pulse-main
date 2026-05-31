const AUTH_BASE_URL =
  ((import.meta as any).env?.VITE_AUTH_URL as string | undefined)?.trim();

const SGA_CLIENT_ID =
  ((import.meta as any).env?.VITE_AUTH_CLIENT_ID as string | undefined)?.trim() || "sga";

export function buildAuthRedirectUrl(path: "/" | "/register" = "/") {
  if (!AUTH_BASE_URL) {
    console.warn("[SGA] VITE_AUTH_URL não configurado — login indisponível");
    return window.location.origin;
  }
  const url = new URL(path, AUTH_BASE_URL);
  url.searchParams.set("client_id", SGA_CLIENT_ID);
  url.searchParams.set("redirect_uri", `${window.location.origin}/auth/callback`);
  return url.toString();
}

export function redirectToAuth(path: "/" | "/register" = "/") {
  if (!AUTH_BASE_URL) {
    console.warn("[SGA] VITE_AUTH_URL não configurado — login indisponível");
    return;
  }
  window.location.replace(buildAuthRedirectUrl(path));
}
