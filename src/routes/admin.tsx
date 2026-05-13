import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { tournaments, teams, players, matches, highlights, gallery } from "@/mocks/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { Trophy, Users, Swords, Activity, Image as Img, Film, Plus, Search, Upload, Trash2, Pencil } from "lucide-react";
import { StatsCard } from "@/components/sga/StatsCard";
import { toast } from "sonner";

/**
 * Definição da rota '/admin' utilizando TanStack Router.
 * O meta-dado 'head' garante SEO e títulos dinâmicos.
 */
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SGA" }] }),
  component: Admin,
});

/**
 * Configuração estática das abas de navegação interna.
 * O uso de 'as const' garante tipagem forte para as chaves (tabs).
 */
const tabs = [
  { k: "campeonatos", label: "Campeonatos" },
  { k: "times", label: "Times" },
  { k: "jogadores", label: "Jogadores" },
  { k: "partidas", label: "Partidas" },
  { k: "highlights", label: "Highlights" },
  { k: "galeria", label: "Galeria" },
] as const;

function Admin() {
  // Gerenciamento de estado local para UI e filtros.
  // Em produção, 'page' e 'q' poderiam ser movidos para a URL (Search Params)
  // para permitir que o usuário compartilhe links de busca.
  const [tab, setTab] = useState<(typeof tabs)[number]["k"]>("campeonatos");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PAGE = 8;

  /**
   * Ponto de Integração: Mock de ações (Create/Edit/Delete).
   * Em uma API real, estas funções seriam mutações (useMutation do TanStack Query).
   */
  const fakeAct = (label: string) => () => toast.success(`${label} (mock)`);

  /**
   * Lógica de Paginação Client-Side.
   * Engenharia: Idealmente substituída por paginação Server-Side (API com limit/offset).
   */
  function paginate<T>(arr: T[]) {
    const start = (page - 1) * PAGE;
    return { items: arr.slice(start, start + PAGE), pages: Math.ceil(arr.length / PAGE) };
  }

  /**
   * Componente de Cabeçalho Funcional.
   * Encapsula a lógica de busca e botões de ação globais da aba.
   */
  function HeaderBar({ create }: { create: string }) {
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filtrar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" onClick={fakeAct("Upload realizado")}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
        <Button className="bg-neon shadow-neon" onClick={fakeAct(`${create} criado`)}><Plus className="h-4 w-4 mr-1" /> {create}</Button>
      </div>
    );
  }

  function Pagination({ pages }: { pages: number }) {
    return (
      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
        <span className="text-muted-foreground">{page} / {pages}</span>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
      </div>
    );
  }

  function RowActions() {
    return (
      <div className="flex justify-end gap-1">
        <Button size="icon" variant="ghost" onClick={fakeAct("Editado")}><Pencil className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" onClick={fakeAct("Removido")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    );
  }

  /**
   * Helper de Filtragem Local.
   * Integração: O filtro 'q' deve ser enviado como parâmetro para a API em ambientes produtivos.
   */
  const filt = (arr: any[], key: string) => arr.filter((x) => String(x[key]).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img src="https://santos-games.com/encontre-um-time/assets/sga-logo-B5SOul8E.png" alt="SGA Logo" className="h-12 w-auto" />
          <h1 className="font-display text-3xl uppercase tracking-widest">Painel de controle</h1>
        </div>
      </div>

      {/* Dashboard de Visão Geral utilizando StatsCards reutilizáveis */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Campeonatos" value={tournaments.length} icon={Trophy} accent />
        <StatsCard label="Times" value={teams.length} icon={Users} />
        <StatsCard label="Jogadores" value={players.length} icon={Activity} />
        <StatsCard label="Partidas" value={matches.length} icon={Swords} />
      </div>

      {/* Sistema de Tabulação por Estado */}
      <div className="mt-8 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => { setTab(t.k); setPage(1); }}
            className={`px-4 py-2 text-xs uppercase tracking-widest -mb-px border-b-2 transition ${
              tab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="mt-6">
        {/* 
            Blocos de Renderização Condicional por Aba.
            Pontos de Integração: Cada 'f' (filtro) consome dados de '@/mocks/data'.
        */}
        {tab === "campeonatos" && (() => {
          const f = filt(tournaments, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              <HeaderBar create="Novo campeonato" />
              <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Nome</th><th className="text-left">Status</th><th>Times</th><th>Premiação</th><th>Início</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((t) => (
                      <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3 font-display">{t.name}</td>
                        <td><StatusBadge status={t.status} /></td>
                        <td className="text-center">{t.teamsCount}</td>
                        <td className="text-center">{t.prize}</td>
                        <td className="text-center">{new Date(t.startDate).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3"><RowActions /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "times" && (() => {
          const f = filt(teams, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              <HeaderBar create="Novo time" />
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Time</th><th>ELO</th><th>V</th><th>D</th><th>Troféus</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((t) => (
                      <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><TeamLogo team={t} size={28} /><span className="font-display">{t.name}</span></div></td>
                        <td className="text-center text-primary font-display">{t.elo}</td>
                        <td className="text-center text-success">{t.wins}</td>
                        <td className="text-center text-destructive">{t.losses}</td>
                        <td className="text-center">{t.trophies}</td>
                        <td className="px-4 py-3"><RowActions /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "jogadores" && (() => {
          const f = filt(players, "nick");
          const { items, pages } = paginate(f);
          return (
            <>
              <HeaderBar create="Novo jogador" />
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Nick</th><th>Role</th><th>K/D/A</th><th>Rating</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><img src={p.avatar} className="h-7 w-7 rounded-full" alt="" /><span className="font-display">{p.nick}</span></div></td>
                        <td className="text-center">{p.role}</td>
                        <td className="text-center">{p.kills}/{p.deaths}/{p.assists}</td>
                        <td className="text-center text-primary font-display">{p.rating}</td>
                        <td className="px-4 py-3"><RowActions /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "partidas" && (() => {
          const f = matches.filter((m) => (m.teamA.name + m.teamB.name).toLowerCase().includes(q.toLowerCase()));
          const { items, pages } = paginate(f);
          return (
            <>
              <HeaderBar create="Nova partida" />
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Confronto</th><th>Mapa</th><th>Placar</th><th>Status</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((m) => (
                      <tr key={m.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3 font-display">{m.teamA.tag} vs {m.teamB.tag}</td>
                        <td className="text-center">{m.map}</td>
                        <td className="text-center">{m.scoreA} — {m.scoreB}</td>
                        <td className="text-center"><StatusBadge status={m.status} /></td>
                        <td className="px-4 py-3"><RowActions /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "highlights" && (
          <>
            <HeaderBar create="Novo highlight" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {highlights.map((h) => (
                <div key={h.id} className="rounded-xl overflow-hidden border border-border/60 bg-card-grad">
                  <div className="relative aspect-video"><img src={h.thumbnail} className="h-full w-full object-cover" alt="" /><Film className="absolute top-2 right-2 h-5 w-5 text-primary" /></div>
                  <div className="p-3">
                    <div className="text-sm font-display truncate">{h.title}</div>
                    <div className="mt-2 flex justify-end"><RowActions /></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "galeria" && (
          <>
            <HeaderBar create="Adicionar imagem" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((src, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden">
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button size="icon" variant="ghost" onClick={fakeAct("Editado")}><Img className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={fakeAct("Removido")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
