import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, mapRole } from "@/store/auth";
import {
  User, Shield, Monitor, LogOut, ChevronRight,
  Check, Loader2, Eye, EyeOff, AlertTriangle,
  Smartphone, Globe, Clock, Trash2, Search,
  MousePointer2, Palette, Gamepad2, Zap,
  Twitter, Instagram, Twitch, MessageSquare, Camera,
  ShieldCheck, ShieldOff, Copy, QrCode, Mail,
  PanelLeft, Menu, X, ArrowLeft,
} from "lucide-react";
import {
  usePreferences, ACCENT_COLORS, BG_THEMES,
  type CursorStyle, type AccentColor, type BgTheme, type NavLayout,
  applyAccent, applyBgTheme,
} from "@/store/preferences";
import ApiService from "@/API/service";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import QRCode from "react-qr-code";

const AUTH_URL = ((import.meta as any).env?.VITE_AUTH_URL as string | undefined)?.trim()?.replace(/\/$/, "") ?? "";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: ogMeta({ title: "Configurações — SGA", description: "Gerencie sua conta na Santos Games Arena.", path: "/settings" }) }),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: VALID_SECTIONS.includes(search.tab as Section) ? (search.tab as Section) : undefined,
    "confirm-email": typeof search["confirm-email"] === "string" ? search["confirm-email"] : undefined,
  }),
  component: SettingsPage,
});

const IS_DEV_LOGIN = ((import.meta as any).env?.VITE_DEV_TOKEN_LOGIN as string | undefined)?.trim() === "true";

type Section = "conta" | "seguranca" | "sessoes" | "cursor" | "tema" | "jogos";

const VALID_SECTIONS: Section[] = ["conta", "seguranca", "sessoes", "cursor", "tema", "jogos"];

const NAV_GROUPS: { group: string; items: { id: Section; label: string; icon: typeof User; desc: string }[] }[] = [
  {
    group: "Perfil",
    items: [
      { id: "conta",     label: "Conta",         icon: User,         desc: "Dados do perfil" },
    ],
  },
  {
    group: "Acesso",
    items: [
      { id: "seguranca", label: "Segurança",      icon: Shield,       desc: "Senha e acesso" },
      { id: "sessoes",   label: "Sessões Ativas", icon: Monitor,      desc: "Dispositivos conectados" },
    ],
  },
  {
    group: "Aparência",
    items: [
      { id: "cursor",    label: "Cursor",         icon: MousePointer2, desc: "Estilo do cursor" },
      { id: "tema",      label: "Tema",           icon: Palette,       desc: "Cores e animações" },
    ],
  },
  {
    group: "Jogos",
    items: [
      { id: "jogos",     label: "Contas Vinculadas", icon: Gamepad2,  desc: "Riot, Steam e mais" },
    ],
  },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

function SettingsPage() {
  const user = useAuth((s) => s.user);
  const navLayout = usePreferences((s) => s.navLayout);
  const isSidebar = navLayout === "sidebar";
  const router = useRouter();
  const navigate = useNavigate();
  const { tab } = Route.useSearch();
  const [section, setSection] = useState<Section>(tab ?? "conta");
  const [navFilter, setNavFilter] = useState("");

  function handleClose() {
    if (router.history.length > 1) router.history.back();
    else navigate({ to: "/" });
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#06070a] px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-6 text-xs uppercase tracking-widest">Você precisa estar autenticado.</p>
          <Link to="/login" className="bg-primary text-primary-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors">
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  const activeItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === section);

  return (
    <div className={`fixed inset-0 ${isSidebar ? "top-20 md:top-0 z-[81]" : "top-20 z-20"} bg-[var(--bg-base,#06070a)] flex overflow-hidden`}>
      <div className="absolute inset-0 grid-bg opacity-[0.04] pointer-events-none" />

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full bg-[#080809] border-r border-white/[0.06] z-10">
        {/* Título */}
        <div className="px-5 py-5 border-b border-white/[0.06] shrink-0">
          <h1 className="font-display text-xl uppercase leading-none font-black italic tracking-tight text-white">
            Config<span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-widest">Conta e preferências</p>
        </div>

        {/* Filtro */}
        <div className="px-3 py-3 border-b border-white/[0.06] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
            <input
              type="text"
              value={navFilter}
              onChange={(e) => setNavFilter(e.target.value)}
              placeholder="Filtrar..."
              className="w-full bg-white/[0.03] border border-white/[0.06] pl-8 pr-3 py-2 text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Nav — scroll interno */}
        <nav className="flex-1 py-2 overflow-y-auto min-h-0">
          {NAV_GROUPS.map((group, gi) => {
            const filtered = group.items.filter(
              (item) => !navFilter.trim() || item.label.toLowerCase().includes(navFilter.toLowerCase())
            );
            if (filtered.length === 0) return null;
            return (
              <div key={group.group}>
                {gi > 0 && <div className="my-2 mx-4 h-px bg-white/[0.05]" />}
                <div className="px-4 pb-1 pt-3">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/35">{group.group}</span>
                </div>
                {filtered.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-l-2 ${
                        active
                          ? "border-primary bg-primary/10 text-white"
                          : "border-transparent text-muted-foreground/70 hover:text-white hover:bg-white/5 hover:border-white/15"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : ""}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black uppercase tracking-widest leading-none">{item.label}</div>
                        <div className="text-xs text-muted-foreground/40 mt-0.5 truncate">{item.desc}</div>
                      </div>
                      {active && <ChevronRight className="h-3 w-3 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Logout fixo no fundo */}
        <div className="border-t border-white/[0.06] shrink-0">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Área de conteúdo ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Header da seção atual */}
        <div className="shrink-0 px-4 md:px-8 py-4 border-b border-white/[0.06] bg-[#06070a]/80 backdrop-blur-sm flex items-center gap-3">
          {activeItem && (
            <>
              <activeItem.icon className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-sm font-black uppercase italic tracking-widest text-white leading-none truncate">
                  {activeItem.label}
                </h2>
                <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">{activeItem.desc}</p>
              </div>
            </>
          )}
          <button
            onClick={handleClose}
            title="Fechar configurações"
            className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-destructive border border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive transition-all"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fechar</span>
          </button>
        </div>

        {/* Mobile: tabs de navegação horizontal (substitui a sidebar oculta) */}
        <div className="md:hidden shrink-0 border-b border-white/[0.06] bg-[#080809] overflow-x-auto">
          <div className="flex min-w-max">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 text-center border-b-2 transition-all shrink-0 ${
                    active
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl w-full mx-auto">
            {section === "conta"     && <ContaSection user={user} />}
            {section === "seguranca" && <SegurancaSection />}
            {section === "sessoes"   && <SessoesSection />}
            {section === "cursor"    && <CursorSection />}
            {section === "tema"      && <TemaSection />}
            {section === "jogos"     && <JogosSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seção: Conta                                                        */
/* ------------------------------------------------------------------ */
const API_BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function ContaSection({ user }: { user: NonNullable<ReturnType<typeof useAuth>["prototype"]> | any }) {
  const updateUser = useAuth((s) => s.updateUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState<string>(user.bio ?? "");
  const [twitter, setTwitter] = useState<string>(user.socialTwitter ?? "");
  const [instagram, setInstagram] = useState<string>(user.socialInstagram ?? "");
  const [twitch, setTwitch] = useState<string>(user.socialTwitch ?? "");
  const [discord, setDiscord] = useState<string>(user.socialDiscord ?? "");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl ?? user.avatar ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Alterar e-mail ──────────────────────────────────────────────────────
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailConfirmStatus, setEmailConfirmStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const { "confirm-email": confirmEmailToken } = Route.useSearch();

  // Confirma mudança de e-mail via token na URL
  useEffect(() => {
    const token = confirmEmailToken;
    if (!token || !AUTH_URL) return;
    setEmailConfirmStatus("loading");
    fetch(`${AUTH_URL}/api/auth/change-email/confirm`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          updateUser({ email: data.newEmail });
          setEmailConfirmStatus("success");
          window.history.replaceState({}, "", window.location.pathname);
        } else {
          setEmailConfirmStatus("error");
        }
      })
      .catch(() => setEmailConfirmStatus("error"));
  }, [updateUser]);

  async function handleEmailChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    setEmailChangeLoading(true);
    setEmailChangeError(null);
    try {
      const r = await fetch(`${AUTH_URL}/api/auth/change-email/request`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await r.json();
      if (!r.ok) {
        const msgs: Record<string, string> = {
          invalid_password: "Senha incorreta.",
          same_email: "O novo e-mail é igual ao atual.",
          email_taken: "Este e-mail já está em uso.",
        };
        throw new Error(msgs[data.error] ?? data.message ?? "Erro ao solicitar alteração.");
      }
      setEmailChangeSent(true);
    } catch (err: any) {
      setEmailChangeError(err.message ?? "Erro ao solicitar alteração.");
    } finally {
      setEmailChangeLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", avatarFile);
      const res = await fetch(`${AUTH_URL}/api/auth/avatar`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message ?? `Erro ${res.status}`);
      }
      const data = await res.json();
      updateUser({ avatarUrl: data.avatarUrl });
      setAvatarFile(null);
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível enviar a foto.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/User/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bio: bio || null,
          avatarUrl: user.avatarUrl || null,
          socialTwitter: twitter || null,
          socialInstagram: instagram || null,
          socialTwitch: twitch || null,
          socialDiscord: discord || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.errors?.[0] ?? `Erro ${res.status}`);
      }
      const data = await res.json();
      if (data?.result) {
        updateUser({
          bio: data.result.bio,
          socialTwitter: data.result.socialTwitter,
          socialInstagram: data.result.socialInstagram,
          socialTwitch: data.result.socialTwitch,
          socialDiscord: data.result.socialDiscord,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell title="Conta" subtitle="Informações e personalização do seu perfil">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coluna esquerda: identidade ── */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="bg-[#0a0a0c]/60 border border-white/5 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Foto de Perfil</p>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    : <User className="h-8 w-8 text-muted-foreground/30" />}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary flex items-center justify-center" title="Alterar foto">
                  <Camera className="h-3 w-3 text-primary-foreground" />
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
              </div>
              <div className="flex-1 min-w-0">
                {avatarFile ? (
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 truncate">{avatarFile.name}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 transition-colors">
                        {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                        {uploadingAvatar ? "Enviando..." : "Enviar"}
                      </button>
                      <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(user.avatarUrl ?? null); }}
                        className="px-3 py-1.5 text-xs text-muted-foreground border border-white/10 hover:border-white/20 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-white/70">Clique no ícone para trocar</p>
                    <p className="text-xs text-muted-foreground/40 mt-0.5">JPG, PNG, WebP — máx. 5 MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dados somente leitura */}
          <div className="bg-[#0a0a0c]/60 border border-white/5 divide-y divide-white/[0.04]">
            <div className="px-5 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Informações da Conta</p>
            </div>
            {[
              { label: "Login",        value: user.login },
              { label: "E-mail",       value: user.email },
              { label: "Membro desde", value: formatDate(user.createdAt) },
              { label: "Status",       value: user.isActive ? "Ativo" : "Inativo" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-2 px-5 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{r.label}</span>
                <span className="text-sm font-mono text-white/80 text-right">{r.value ?? "—"}</span>
              </div>
            ))}
          </div>

          {/* Confirmação de troca de e-mail via link */}
          {emailConfirmStatus === "loading" && (
            <div className="bg-primary/10 border border-primary/30 px-5 py-3 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              <p className="text-xs text-primary">Confirmando alteração de e-mail...</p>
            </div>
          )}
          {emailConfirmStatus === "success" && (
            <div className="bg-green-500/10 border border-green-500/30 px-5 py-3 flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
              <p className="text-xs text-green-400">E-mail atualizado com sucesso!</p>
            </div>
          )}
          {emailConfirmStatus === "error" && (
            <div className="bg-destructive/10 border border-destructive/30 px-5 py-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <p className="text-xs text-destructive">Link expirado ou inválido.</p>
            </div>
          )}

          {/* Alterar e-mail */}
          <div className="bg-[#0a0a0c]/40 border border-white/[0.04] px-5 py-3">
            {!emailChangeOpen && !emailChangeSent ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50">Para alterar o login, contate um administrador.</p>
                <button
                  onClick={() => setEmailChangeOpen(true)}
                  className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors shrink-0"
                >
                  Alterar e-mail
                </button>
              </div>
            ) : emailChangeSent ? (
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                <p className="text-xs text-green-400">
                  E-mail de confirmação enviado para <strong>{newEmail}</strong>. Verifique sua caixa de entrada.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailChangeRequest} className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Alterar E-mail</p>
                <div>
                  <label className="block text-xs text-muted-foreground/60 mb-1">Novo e-mail</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="novo@email.com"
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground/60 mb-1">Confirme com sua senha atual</label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                {emailChangeError && <p className="text-xs text-destructive">{emailChangeError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={emailChangeLoading}
                    className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {emailChangeLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Enviar confirmação
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmailChangeOpen(false); setEmailChangeError(null); setNewEmail(""); setEmailPassword(""); }}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Coluna direita: bio + redes ── */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Bio */}
          <div className="bg-[#0a0a0c]/60 border border-white/5 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Biografia</p>
            <p className="text-xs text-muted-foreground/50 mb-3">Aparece no seu perfil público</p>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={4}
              placeholder="Conte um pouco sobre você..."
              className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 transition-colors resize-none" />
            <div className="text-right text-xs text-muted-foreground/40 mt-1">{bio.length}/280</div>
          </div>

          {/* Redes sociais */}
          <div className="bg-[#0a0a0c]/60 border border-white/5 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Redes Sociais</p>
            <div className="space-y-3">
              {[
                { icon: Twitter,       label: "Twitter / X",  value: twitter,   setter: setTwitter,   placeholder: "@usuario" },
                { icon: Instagram,     label: "Instagram",    value: instagram, setter: setInstagram, placeholder: "@usuario" },
                { icon: Twitch,        label: "Twitch",       value: twitch,    setter: setTwitch,    placeholder: "nome do canal" },
                { icon: MessageSquare, label: "Discord",      value: discord,   setter: setDiscord,   placeholder: "usuario ou handle" },
              ].map(({ icon: Icon, label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                    <input type="text" value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                      className="w-full border border-white/10 bg-white/[0.03] pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Salvar Perfil
            </button>
            {saved && <span className="text-xs text-success font-bold uppercase tracking-widest">Salvo!</span>}
          </div>
        </form>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Seção: Segurança                                                    */
/* ------------------------------------------------------------------ */
function SegurancaSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentPassword) { setError("Informe a senha atual."); return; }
    if (newPassword.length < 8) { setError("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, password: newPassword }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message ?? `Erro ${res.status}`);
      }
      setSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  const strength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ["", "Fraca", "Média", "Boa", "Forte"][strength];
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-blue-500", "bg-success"][strength];

  return (
    <SectionShell title="Segurança" subtitle="Senha e autenticação em dois fatores">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coluna esquerda: senha ── */}
        <form onSubmit={handleSubmit} className="bg-[#0a0a0c]/60 border border-white/5 p-5 space-y-4 self-start">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alterar Senha</p>

          <Field label="Senha Atual">
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} placeholder="Sua senha atual" autoComplete="current-password" />
          </Field>

          <div className="h-px bg-white/[0.04]" />

          <Field label="Nova Senha">
            <PasswordInput value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 transition-colors ${i <= strength ? strengthColor : "bg-white/10"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{strengthLabel}</p>
              </div>
            )}
          </Field>

          <Field label="Confirmar Nova Senha">
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Repita a nova senha" autoComplete="new-password"
              className={confirmPassword && confirmPassword !== newPassword ? "border-destructive/60 focus:border-destructive" : ""} />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-destructive mt-1.5">As senhas não coincidem</p>
            )}
          </Field>

          {error && (
            <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 border border-success/30 bg-success/10 px-3 py-2.5 text-xs text-success">
              <Check className="h-3.5 w-3.5" /> Senha alterada com sucesso!
            </div>
          )}

          <button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Salvar Nova Senha
          </button>
        </form>

        {/* ── Coluna direita: 2FA ── */}
        <div className="self-start">
          <TwoFactorBlock />
        </div>
      </div>
    </SectionShell>
  );
}

function TwoFactorBlock() {
  const user = useAuth((s) => s.user);
  type Step = "idle" | "method-select" | "setup-app" | "setup-email" | "codes";
  const [step, setStep] = useState<Step>("idle");
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [sendingDisableOtp, setSendingDisableOtp] = useState(false);
  const [disableOtpSent, setDisableOtpSent] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpMethod, setTotpMethod] = useState<"authenticator" | "email" | null>(null);
  const [emailMasked, setEmailMasked] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch(`${AUTH_URL}/api/auth/session`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.user?.totpEnabled !== undefined) setTotpEnabled(d.user.totpEnabled);
        if (d?.user?.totpMethod !== undefined) setTotpMethod(d.user.totpMethod ?? null);
      })
      .catch(() => {});
  }, [user]);

  function reset() {
    setStep("idle"); setCode(""); setError(null);
    setSecret(""); setOtpauthUrl(""); setEmailMasked("");
  }

  async function startSetupApp() {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/2fa/setup?method=authenticator`, { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao iniciar configuração.");
      const data = await res.json();
      setSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
      setStep("setup-app");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function startSetupEmail() {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/2fa/email/send-code`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao enviar código.");
      const data = await res.json();
      setEmailMasked(data.email ?? "");
      setStep("setup-email");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnableApp() {
    if (code.length !== 6) { setError("Digite o código de 6 dígitos."); return; }
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/2fa/enable`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ secret, code }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message ?? "Código inválido.");
      }
      const data = await res.json();
      setBackupCodes(data.backupCodes ?? []);
      setTotpEnabled(true);
      setTotpMethod("authenticator");
      setStep("codes");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnableEmail() {
    if (code.length !== 6) { setError("Digite o código de 6 dígitos."); return; }
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/2fa/email/confirm`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message ?? "Código inválido.");
      }
      setTotpEnabled(true);
      setTotpMethod("email");
      setStep("idle");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendDisableOtp() {
    setSendingDisableOtp(true); setDisableOtpSent(false); setError(null);
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/2fa/email/send-disable-code`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao enviar código.");
      setDisableOtpSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSendingDisableOtp(false);
    }
  }

  async function handleDisable() {
    if (!disableCode) { setError("Informe o código ou sua senha."); return; }
    setError(null); setDisabling(true);
    try {
      const isNumeric = /^\d{6}$/.test(disableCode);
      const body = isNumeric ? { code: disableCode } : { password: disableCode };
      const res = await fetch(`${AUTH_URL}/api/auth/2fa/disable`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message ?? "Falha ao desabilitar.");
      }
      setTotpEnabled(false);
      setTotpMethod(null);
      setDisableCode("");
      setDisableOtpSent(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDisabling(false);
    }
  }

  const methodLabel = totpMethod === "email"
    ? "Ativa — código enviado por e-mail no login."
    : totpMethod === "authenticator"
    ? "Ativa — use um app autenticador para fazer login."
    : "Inativa — adicione uma camada extra de segurança.";

  return (
    <div className="bg-[#0a0a0c]/60 border border-white/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${totpEnabled ? "bg-success/10 text-success" : "bg-white/5 text-muted-foreground"}`}>
          {totpEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-white">Autenticação em 2 Fatores (2FA)</p>
          <p className="text-xs text-muted-foreground mt-0.5">{methodLabel}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive mb-4">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Escolher método */}
      {!totpEnabled && step === "idle" && (
        <button onClick={() => { setError(null); setStep("method-select"); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors">
          <ShieldCheck className="h-3.5 w-3.5" />
          Configurar 2FA
        </button>
      )}

      {/* Seleção de método */}
      {step === "method-select" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">Escolha como deseja receber os códigos de verificação:</p>
          <button onClick={startSetupApp} disabled={loading}
            className="w-full flex items-center gap-3 border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04] px-4 py-3 text-left transition-colors">
            <div className="p-2 bg-primary/10 text-primary shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">App Autenticador</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Google Authenticator, Authy, etc. Mais seguro.</p>
            </div>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" /> : <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />}
          </button>
          <button onClick={startSetupEmail} disabled={loading}
            className="w-full flex items-center gap-3 border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04] px-4 py-3 text-left transition-colors">
            <div className="p-2 bg-blue-500/10 text-blue-400 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">E-mail</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Código enviado para seu e-mail a cada login.</p>
            </div>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" /> : <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />}
          </button>
          <button onClick={reset}
            className="text-xs text-muted-foreground hover:text-white transition-colors">
            Cancelar
          </button>
        </div>
      )}

      {/* Setup via App Autenticador */}
      {step === "setup-app" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] p-4 space-y-4">
            <p className="text-xs text-white/60">
              1. Abra seu app autenticador (Google Authenticator, Authy, etc.) e escaneie o QR code ou adicione a chave manualmente.
            </p>
            {otpauthUrl && (
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-sm inline-block">
                  <QRCode value={otpauthUrl} size={160} />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 break-all flex-1">{secret}</code>
              <button type="button" onClick={() => navigator.clipboard.writeText(secret)}
                className="p-1.5 text-muted-foreground hover:text-white transition-colors" title="Copiar chave">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              2. Digite o código gerado para confirmar
            </label>
            <div className="flex gap-2">
              <input type="text" inputMode="numeric" maxLength={6} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-36 border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white font-mono tracking-[0.3em] placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60" />
              <button onClick={confirmEnableApp} disabled={loading || code.length !== 6}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 transition-colors">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Ativar
              </button>
              <button onClick={reset}
                className="px-4 py-2.5 text-xs text-muted-foreground border border-white/10 hover:border-white/20 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup via E-mail */}
      {step === "setup-email" && (
        <div className="space-y-4">
          <div className="bg-blue-500/[0.04] border border-blue-500/20 px-4 py-3 text-xs text-blue-300">
            Código de verificação enviado para <strong>{emailMasked || "seu e-mail"}</strong>. Verifique sua caixa de entrada.
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Digite o código de 6 dígitos
            </label>
            <div className="flex gap-2">
              <input type="text" inputMode="numeric" maxLength={6} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-36 border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white font-mono tracking-[0.3em] placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60" />
              <button onClick={confirmEnableEmail} disabled={loading || code.length !== 6}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 transition-colors">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Confirmar
              </button>
              <button onClick={reset}
                className="px-4 py-2.5 text-xs text-muted-foreground border border-white/10 hover:border-white/20 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Códigos de backup (só para autenticador) */}
      {step === "codes" && (
        <div className="space-y-3">
          <p className="text-xs text-white/70">
            ✅ 2FA ativado! Guarde estes <strong>códigos de recuperação</strong> em um local seguro. Cada um só pode ser usado uma vez.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((c, i) => (
              <code key={i} className="text-xs font-mono bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-white/80">{c}</code>
            ))}
          </div>
          <button onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
            <Copy className="h-3.5 w-3.5" /> Copiar todos
          </button>
          <button onClick={reset}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-white/20 transition-colors">
            <Check className="h-3.5 w-3.5 text-success" /> Entendi, já salvei
          </button>
        </div>
      )}

      {/* Desabilitar 2FA */}
      {totpEnabled && step === "idle" && (
        <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-3">
          {totpMethod === "email" ? (
            <>
              <p className="text-xs text-muted-foreground">Para desabilitar, informe o código enviado ao seu e-mail ou sua senha:</p>
              {!disableOtpSent && (
                <button onClick={sendDisableOtp} disabled={sendingDisableOtp}
                  className="flex items-center gap-2 border border-blue-500/30 text-blue-400 hover:border-blue-400 px-4 py-2 text-xs font-black uppercase tracking-widest disabled:opacity-40 transition-colors">
                  {sendingDisableOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                  Enviar código por e-mail
                </button>
              )}
              {disableOtpSent && (
                <p className="text-xs text-blue-400">✓ Código enviado! Insira abaixo para desabilitar.</p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Para desabilitar, informe o código TOTP ou sua senha:</p>
          )}
          <div className="flex gap-2">
            <input type="text" value={disableCode} onChange={e => setDisableCode(e.target.value)}
              placeholder={totpMethod === "email" ? "Código de e-mail ou senha" : "Código TOTP ou senha"}
              className="flex-1 border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-destructive/60 transition-colors" />
            <button onClick={handleDisable} disabled={disabling || !disableCode}
              className="flex items-center gap-2 border border-destructive/40 text-destructive/80 hover:border-destructive hover:text-destructive px-4 py-2.5 text-xs font-black uppercase tracking-widest disabled:opacity-40 transition-colors">
              {disabling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
              Desabilitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seção: Sessões Ativas                                               */
/* ------------------------------------------------------------------ */
type SessionEntry = {
  id: number;
  deviceLabel: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  current: boolean;
};

function SessoesSection() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<{ sessions: SessionEntry[] }>({
    queryKey: ["sessions"],
    queryFn: () =>
      fetch(`${AUTH_URL}/api/auth/sessions`, { credentials: "include" }).then(r => {
        if (!r.ok) throw new Error("Falha ao carregar sessões");
        return r.json();
      }),
    enabled: !!AUTH_URL && !IS_DEV_LOGIN,
    retry: false,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`${AUTH_URL}/api/auth/sessions/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: () =>
      fetch(`${AUTH_URL}/api/auth/sessions/revoke-others`, { method: "POST", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });

  const sessions = data?.sessions ?? [];
  const others = sessions.filter(s => !s.current);

  function deviceIcon(ua: string | null) {
    if (!ua) return Globe;
    const lower = ua.toLowerCase();
    if (/android|iphone|ipad|mobile/.test(lower)) return Smartphone;
    return Monitor;
  }

  function parseBrowser(ua: string | null): string {
    if (!ua) return "Dispositivo desconhecido";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return ua.slice(0, 40);
  }

  return (
    <SectionShell
      title="Sessões Ativas"
      subtitle="Dispositivos com acesso à sua conta"
      action={
        others.length > 0 ? (
          <button
            onClick={() => revokeOthersMutation.mutate()}
            disabled={revokeOthersMutation.isPending}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-destructive/70 hover:text-destructive transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" />
            Revogar outras sessões
          </button>
        ) : undefined
      }
    >
      {IS_DEV_LOGIN && (
        <div className="flex items-start gap-3 border border-warning/20 bg-warning/5 px-5 py-4 text-xs text-warning/80">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Sessões indisponíveis em modo dev — cookies SameSite=Lax não são enviados cross-site do localhost.
            Funciona normalmente em produção.
          </span>
        </div>
      )}

      {isLoading && !IS_DEV_LOGIN && (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs uppercase tracking-widest">Carregando sessões...</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 border border-destructive/20 bg-destructive/5 px-5 py-4 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Não foi possível carregar as sessões. Verifique sua conexão.
        </div>
      )}

      {!isLoading && !isError && sessions.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-xs uppercase tracking-widest">
          Nenhuma sessão encontrada.
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((s) => {
          const Icon = deviceIcon(s.userAgent);
          return (
            <div
              key={s.id}
              className={`flex items-start gap-4 p-5 border transition-colors ${
                s.current
                  ? "border-primary/30 bg-primary/5"
                  : "border-white/5 bg-[#0a0a0c]/60 hover:border-white/10"
              }`}
            >
              <div className={`p-2.5 shrink-0 ${s.current ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{parseBrowser(s.userAgent)}</span>
                  {s.current && (
                    <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/15 px-2 py-0.5">
                      Esta sessão
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {s.ip && <span className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{s.ip}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Último acesso: {formatDate(s.lastUsedAt ?? s.createdAt)}</span>
                </div>
              </div>

              {!s.current && (
                <button
                  onClick={() => revokeMutation.mutate(s.id)}
                  disabled={revokeMutation.isPending}
                  title="Revogar sessão"
                  className="shrink-0 p-2 text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-40"
                >
                  {revokeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Seção: Cursor                                                       */
/* ------------------------------------------------------------------ */
const CURSOR_OPTIONS: { id: CursorStyle; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    id: "system",
    label: "Sistema",
    desc: "Cursor padrão do sistema operacional",
    preview: (
      <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
        <path d="M2 2L18 14L10 16L6 26L2 2Z" fill="white" stroke="black" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "arena",
    label: "Arena",
    desc: "Cursor personalizado da SGA com anel e crosshair",
    preview: (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute w-6 h-6 border border-white/70 rounded-full" />
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
        {[[-9,0],[9,0],[0,-9],[0,9]].map(([x,y],i) => (
          <div key={i} style={{ position:'absolute', left:`calc(50% + ${x}px)`, top:`calc(50% + ${y}px)`, width: x===0?1:4, height: y===0?1:4, background:'rgba(255,255,255,0.7)', transform:'translate(-50%,-50%)' }} />
        ))}
      </div>
    ),
  },
  {
    id: "crosshair",
    label: "Mira",
    desc: "Crosshair simples sem anel",
    preview: (
      <div className="relative w-8 h-8">
        {[{top:'50%',left:0,w:8,h:1},{top:'50%',right:0,w:8,h:1},{left:'50%',top:0,w:1,h:8},{left:'50%',bottom:0,w:1,h:8}].map((s,i) => (
          <div key={i} style={{ position:'absolute', background:'white', width: (s as any).w, height: (s as any).h, top:(s as any).top, left:(s as any).left, right:(s as any).right, bottom:(s as any).bottom, transform:(s as any).top==='50%'||s.left==='50%'?'translate(-50%,-50%)':undefined }} />
        ))}
      </div>
    ),
  },
  {
    id: "dot",
    label: "Ponto",
    desc: "Cursor minimalista — apenas um ponto",
    preview: <div className="w-3 h-3 bg-white rounded-full" style={{ mixBlendMode:'difference' }} />,
  },
];

function CursorSection() {
  const cursor    = usePreferences((s) => s.cursor);
  const setCursor = usePreferences((s) => s.setCursor);
  const isSaving  = usePreferences((s) => s.isSaving);

  return (
    <SectionShell
      title="Cursor"
      subtitle="Escolha o estilo do cursor personalizado"
      saving={isSaving}
    >
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${isSaving ? "pointer-events-none opacity-60" : ""}`}>
        {CURSOR_OPTIONS.map((opt) => {
          const active = cursor === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setCursor(opt.id)}
              disabled={isSaving}
              className={`flex flex-col items-center gap-3 p-5 border-2 transition-all text-left ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-white/[0.06] bg-[#0a0a0c]/60 hover:border-white/20"
              }`}
            >
              <div className="h-12 flex items-center justify-center">{opt.preview}</div>
              <div className="w-full">
                <div className={`text-xs font-black uppercase tracking-widest ${active ? "text-primary" : "text-white"}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{opt.desc}</div>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary self-end ml-auto" />}
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Seção: Tema                                                         */
/* ------------------------------------------------------------------ */
function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-12 h-6 transition-colors shrink-0 ${value ? "bg-primary" : "bg-white/10"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white transition-all ${value ? "left-7" : "left-1"}`} />
    </button>
  );
}

function TemaSection() {
  const accent               = usePreferences((s) => s.accent);
  const setAccent            = usePreferences((s) => s.setAccent);
  const bgTheme              = usePreferences((s) => s.bgTheme);
  const setBgTheme           = usePreferences((s) => s.setBgTheme);
  const navLayout            = usePreferences((s) => s.navLayout);
  const setNavLayout         = usePreferences((s) => s.setNavLayout);
  const sidebarAutoExpand    = usePreferences((s) => s.sidebarAutoExpand);
  const setSidebarAutoExpand = usePreferences((s) => s.setSidebarAutoExpand);
  const reducedMotion        = usePreferences((s) => s.reducedMotion);
  const setReducedMotion     = usePreferences((s) => s.setReducedMotion);
  const isSaving             = usePreferences((s) => s.isSaving);

  function handleAccent(a: AccentColor) {
    setAccent(a);
    applyAccent(a);
  }

  function handleBgTheme(t: BgTheme) {
    setBgTheme(t);
    applyBgTheme(t);
  }

  return (
    <SectionShell title="Tema" subtitle="Personalize cores, fundo e navegação da plataforma" saving={isSaving}>
      <div className="space-y-6">

        {/* ── Temas de fundo ── */}
        <div className="bg-[#0a0a0c]/60 border border-white/5 p-6">
          <p className="text-sm font-black uppercase tracking-widest text-white mb-1">Tema de Fundo</p>
          <p className="text-xs text-muted-foreground mb-5">Cor base das páginas da plataforma</p>
          <div className={`flex flex-wrap gap-4 ${isSaving ? "pointer-events-none opacity-60" : ""}`}>
            {(Object.entries(BG_THEMES) as [BgTheme, typeof BG_THEMES[BgTheme]][]).map(([key, val]) => {
              const active = bgTheme === key;
              return (
                <button
                  key={key}
                  onClick={() => handleBgTheme(key)}
                  disabled={isSaving}
                  title={val.label}
                  className={`relative flex flex-col items-center gap-2 group transition-all`}
                >
                  <div
                    className={`w-14 h-14 border-2 transition-all ${active ? "border-primary scale-105" : "border-white/10 hover:border-white/30"}`}
                    style={{ background: val.hex }}
                  >
                    {active && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 drop-shadow" style={{ color: val.hex === "#000000" ? "#fff" : "#fff" }} />
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-primary" : "text-muted-foreground/60"}`}>
                    {val.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cor de destaque ── */}
        <div className="bg-[#0a0a0c]/60 border border-white/5 p-6">
          <p className="text-sm font-black uppercase tracking-widest text-white mb-1">Cor de Destaque</p>
          <p className="text-xs text-muted-foreground mb-5">Afeta botões, bordas ativas e elementos em evidência</p>
          <div className={`flex flex-wrap gap-3 ${isSaving ? "pointer-events-none opacity-60" : ""}`}>
            {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleAccent(key)}
                disabled={isSaving}
                title={val.label}
                className={`relative w-10 h-10 transition-all hover:scale-110 ${accent === key ? "ring-2 ring-offset-2 ring-offset-[var(--bg-base,#06070a)] ring-white/60 scale-110" : ""}`}
                style={{ background: `oklch(${val.oklch})` }}
              >
                {accent === key && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ background: `oklch(${ACCENT_COLORS[accent].oklch})` }} />
            <span className="text-sm text-white font-semibold">{ACCENT_COLORS[accent].label}</span>
            <span className="text-xs font-mono text-muted-foreground">oklch({ACCENT_COLORS[accent].oklch})</span>
          </div>
        </div>

        {/* ── Layout de navegação ── */}
        <div className="bg-[#0a0a0c]/60 border border-white/5 p-6 space-y-5">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-white mb-1">Layout de Navegação</p>
            <p className="text-xs text-muted-foreground">Escolha entre barra superior ou sidebar lateral (desktop)</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isSaving ? "pointer-events-none opacity-60" : ""}`}>
            {([
              {
                id: "top" as NavLayout,
                label: "Barra Superior",
                desc: "Navegação fixada no topo da tela",
                icon: Menu,
              },
              {
                id: "sidebar" as NavLayout,
                label: "Sidebar Lateral",
                desc: "Sidebar colapsável à esquerda",
                icon: PanelLeft,
              },
            ] as const).map(({ id, label, desc, icon: Icon }) => {
              const active = navLayout === id;
              return (
                <button
                  key={id}
                  onClick={() => setNavLayout(id)}
                  disabled={isSaving}
                  className={`flex items-center gap-4 p-4 border-2 text-left transition-all ${active ? "border-primary bg-primary/10" : "border-white/[0.06] hover:border-white/20"}`}
                >
                  <div className={`p-2 ${active ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${active ? "text-primary" : "text-white"}`}>{label}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{desc}</p>
                  </div>
                  {active && <Check className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {navLayout === "sidebar" && (
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white">Auto-expansão ao passar o mouse</p>
                <p className="text-xs text-muted-foreground mt-0.5">Expande a sidebar ao aproximar o cursor</p>
              </div>
              <Toggle value={sidebarAutoExpand} onChange={setSidebarAutoExpand} disabled={isSaving} />
            </div>
          )}
        </div>

        {/* ── Animações ── */}
        <div className="bg-[#0a0a0c]/60 border border-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-white">Reduzir Animações</p>
              <p className="text-xs text-muted-foreground mt-0.5">Desativa efeitos de transição e animações decorativas</p>
            </div>
            <Toggle value={reducedMotion} onChange={setReducedMotion} disabled={isSaving} />
          </div>
        </div>

      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Seção: Jogos / Contas Vinculadas                                    */
/* ------------------------------------------------------------------ */
function JogosSection() {
  const user = useAuth((s) => s.user);

  const { data: gamesRaw } = useQuery({
    queryKey: ["games"],
    queryFn: () => ApiService.get("api/Games"),
    staleTime: 300_000,
  });

  const { data: rankingRaw } = useQuery({
    queryKey: ["ranking-player-per-game"],
    queryFn: async () => {
      const API_BASE = ((import.meta as any).env?.VITE_API_URL as string)?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${API_BASE}/api/Games/GetRankingPlayerPerGame`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const games: any[] = Array.isArray(gamesRaw?.result) ? gamesRaw.result : [];

  // Tenta encontrar o playerId do usuário logado pelo nickname
  const myPlayer = (() => {
    const list: any[] = Array.isArray(rankingRaw?.result) ? rankingRaw.result : [];
    const q = (user?.login ?? "").trim().toLowerCase();
    return list.find((p: any) =>
      String(p.playerNickname ?? "").toLowerCase() === q ||
      String(p.playerName ?? "").toLowerCase().includes(q)
    ) ?? null;
  })();

  const { data: accountsRaw } = useQuery({
    queryKey: ["my-game-accounts", myPlayer?.playerId],
    queryFn: () => ApiService.get(`api/GameAccounts?playerId=${myPlayer.playerId}`),
    enabled: !!myPlayer?.playerId,
    staleTime: 60_000,
  });

  const accounts: any[] = Array.isArray(accountsRaw?.result) ? accountsRaw.result : [];

  const PROVIDER_LABELS: Record<string, string> = {
    Riot: "Riot Games",
    Steam: "Steam",
  };

  return (
    <SectionShell title="Contas Vinculadas" subtitle="Jogos conectados ao seu perfil da arena">
      <div className="space-y-4">
        {!myPlayer && (
          <div className="bg-[#0a0a0c]/60 border border-white/5 p-8 text-center">
            <Gamepad2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/60">Perfil de jogador não encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Seu login <span className="font-mono text-white/40">{user?.login}</span> não está registrado como jogador na arena.
            </p>
          </div>
        )}

        {myPlayer && games.map((game) => {
          const linked = accounts.filter((a: any) => a.gameId === game.id);
          return (
            <div key={game.id} className="bg-[#0a0a0c]/60 border border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">{game.name}</h3>
                <span className="ml-auto text-xs font-mono text-muted-foreground/40 uppercase">{game.title}</span>
              </div>

              {linked.length > 0 ? (
                <div className="space-y-2">
                  {linked.map((acc: any) => (
                    <div key={acc.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.04] px-4 py-3">
                      <Gamepad2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white">
                          {acc.nickname}{acc.tag ? <span className="text-muted-foreground font-normal">#{acc.tag}</span> : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">{PROVIDER_LABELS[acc.provider] ?? acc.provider}</div>
                      </div>
                      {acc.isVerified ? (
                        <span className="text-xs font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5">Verificado</span>
                      ) : (
                        <span className="text-xs font-black uppercase tracking-widest text-warning/70 bg-warning/10 px-2 py-0.5">Pendente</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40 uppercase tracking-widest text-center py-4">
                  Nenhuma conta vinculada para este jogo
                </p>
              )}
            </div>
          );
        })}

        <div className="bg-[#0a0a0c]/40 border border-white/[0.04] px-5 py-4 flex items-start gap-3">
          <Zap className="h-4 w-4 text-warning/60 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground/60">
            O vínculo de contas é gerenciado pelos administradores da arena.
            Entre em contato para adicionar ou remover uma conta de jogo.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Componentes auxiliares                                              */
/* ------------------------------------------------------------------ */
function SectionShell({
  title, subtitle, children, action, saving,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  saving?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black uppercase italic tracking-tight text-foreground flex items-center gap-2">
            <span className="text-primary mr-2">/</span>{title}
            {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" />}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder, autoComplete, className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 pr-10 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors ${className}`}
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LogoutButton() {
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    if (AUTH_URL) await fetch(`${AUTH_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    logout();
    navigate({ to: "/" });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 border-transparent text-muted-foreground/60 hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all disabled:opacity-40"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <LogOut className="h-4 w-4 shrink-0" />}
      <span className="text-xs font-black uppercase tracking-widest">Sair da conta</span>
    </button>
  );
}
