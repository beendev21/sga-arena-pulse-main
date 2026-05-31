import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CursorStyle = "system" | "arena" | "crosshair" | "dot";
export type AccentColor = "red" | "blue" | "green" | "purple" | "cyan" | "orange";
export type BgTheme    = "branco" | "cinza" | "escuro" | "onix";
export type NavLayout  = "top" | "sidebar";

export const ACCENT_COLORS: Record<AccentColor, { label: string; oklch: string }> = {
  red:    { label: "Vermelho", oklch: "0.62 0.21 22"  },
  blue:   { label: "Azul",     oklch: "0.61 0.22 259" },
  green:  { label: "Verde",    oklch: "0.72 0.22 142" },
  purple: { label: "Roxo",     oklch: "0.66 0.28 292" },
  cyan:   { label: "Ciano",    oklch: "0.72 0.16 194" },
  orange: { label: "Laranja",  oklch: "0.71 0.19 52"  },
};

export const BG_THEMES: Record<BgTheme, { label: string; hex: string }> = {
  branco: { label: "Branco", hex: "#ffffff" },
  cinza:  { label: "Cinza",  hex: "#1a1b22" },
  escuro: { label: "Escuro", hex: "#0d0e13" },
  onix:   { label: "Ônix",   hex: "#000000" },
};

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

type ServerPrefs = {
  cursorStyle?: string;
  accentColor?: string;
  bgTheme?: string;
  navLayout?: string;
  sidebarAutoExpand?: boolean;
  reducedMotion?: boolean;
};

async function syncPreferences(prefs: ServerPrefs): Promise<void> {
  if (!API_BASE) return;
  const res = await fetch(`${API_BASE}/api/User/preferences`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error("sync failed");
}

type PreferencesState = {
  cursor: CursorStyle;
  accent: AccentColor;
  bgTheme: BgTheme;
  navLayout: NavLayout;
  sidebarAutoExpand: boolean;
  reducedMotion: boolean;
  isSaving: boolean;
  setCursor: (c: CursorStyle) => void;
  setAccent: (a: AccentColor) => void;
  setBgTheme: (t: BgTheme) => void;
  setNavLayout: (l: NavLayout) => void;
  setSidebarAutoExpand: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  applyServerPreferences: (prefs: ServerPrefs) => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      cursor: "arena",
      accent: "red",
      bgTheme: "escuro",
      navLayout: "top",
      sidebarAutoExpand: true,
      reducedMotion: false,
      isSaving: false,

      setCursor: (cursor) => {
        const prev = get().cursor;
        set({ cursor, isSaving: true });
        syncPreferences({ cursorStyle: cursor })
          .then(() => set({ isSaving: false }))
          .catch(() => set({ cursor: prev, isSaving: false }));
      },

      setAccent: (accent) => {
        const prev = get().accent;
        set({ accent, isSaving: true });
        syncPreferences({ accentColor: accent })
          .then(() => set({ isSaving: false }))
          .catch(() => set({ accent: prev, isSaving: false }));
      },

      setBgTheme: (bgTheme) => {
        const prev = get().bgTheme;
        set({ bgTheme, isSaving: true });
        syncPreferences({ bgTheme })
          .then(() => set({ isSaving: false }))
          .catch(() => set({ bgTheme: prev, isSaving: false }));
      },

      setNavLayout: (navLayout) => {
        const prev = get().navLayout;
        set({ navLayout, isSaving: true });
        syncPreferences({ navLayout })
          .then(() => set({ isSaving: false }))
          .catch(() => set({ navLayout: prev, isSaving: false }));
      },

      setSidebarAutoExpand: (sidebarAutoExpand) => {
        const prev = get().sidebarAutoExpand;
        set({ sidebarAutoExpand, isSaving: true });
        syncPreferences({ sidebarAutoExpand })
          .then(() => set({ isSaving: false }))
          .catch(() => set({ sidebarAutoExpand: prev, isSaving: false }));
      },

      setReducedMotion: (reducedMotion) => {
        const prev = get().reducedMotion;
        set({ reducedMotion, isSaving: true });
        syncPreferences({ reducedMotion })
          .then(() => set({ isSaving: false }))
          .catch(() => set({ reducedMotion: prev, isSaving: false }));
      },

      applyServerPreferences: (prefs) => {
        const updates: Partial<PreferencesState> = {};
        const VALID_CURSORS: CursorStyle[] = ["system", "arena", "crosshair", "dot"];
        const VALID_ACCENTS: AccentColor[] = ["red", "blue", "green", "purple", "cyan", "orange"];
        const VALID_THEMES: BgTheme[] = ["branco", "cinza", "escuro", "onix"];
        const VALID_LAYOUTS: NavLayout[] = ["top", "sidebar"];

        if (prefs.cursorStyle && VALID_CURSORS.includes(prefs.cursorStyle as CursorStyle))
          updates.cursor = prefs.cursorStyle as CursorStyle;
        if (prefs.accentColor && VALID_ACCENTS.includes(prefs.accentColor as AccentColor))
          updates.accent = prefs.accentColor as AccentColor;
        if (prefs.bgTheme && VALID_THEMES.includes(prefs.bgTheme as BgTheme))
          updates.bgTheme = prefs.bgTheme as BgTheme;
        if (prefs.navLayout && VALID_LAYOUTS.includes(prefs.navLayout as NavLayout))
          updates.navLayout = prefs.navLayout as NavLayout;
        if (prefs.sidebarAutoExpand !== undefined)
          updates.sidebarAutoExpand = prefs.sidebarAutoExpand;
        if (prefs.reducedMotion !== undefined)
          updates.reducedMotion = prefs.reducedMotion;

        if (Object.keys(updates).length > 0) {
          set(updates);
          if (updates.accent) applyAccent(updates.accent);
          if (updates.bgTheme) applyBgTheme(updates.bgTheme);
        }
      },
    }),
    { name: "sga-prefs" }
  )
);

export function applyAccent(accent: AccentColor) {
  const { oklch } = ACCENT_COLORS[accent];
  document.documentElement.style.setProperty("--primary", `oklch(${oklch})`);
}

export function applyBgTheme(theme: BgTheme) {
  const { hex } = BG_THEMES[theme];
  const isLight = theme === "branco";
  document.documentElement.style.setProperty("--bg-base", hex);
  document.body.style.background = hex;
  document.body.style.color = "";
  document.documentElement.style.colorScheme = isLight ? "light" : "dark";
  document.documentElement.classList.toggle("theme-light", isLight);
}
