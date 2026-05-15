import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { tournaments, teams, players, matches, highlights, gallery, bracket } from "@/mocks/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { Trophy, Users, Swords, Activity, Image as Img, Film, Plus, Search, Upload, Trash2, Pencil, ShieldAlert, ChevronRight, Crown, Save } from "lucide-react";
import { StatsCard } from "@/components/sga/StatsCard";
import { useAuth } from "@/store/auth";
import { useDataStore } from "@/store/dataStore";
import { toast } from "sonner";
import useApiController from "../API/controler";
import { motion } from "framer-motion";
import { formatDateBR } from "@/lib/dateUtils";

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
  { k: "chaveamentos", label: "Chaveamentos" },
  { k: "highlights", label: "Highlights" },
  { k: "galeria", label: "Galeria" },
] as const;

function Admin() {
  const user = useAuth((s) => s.user);
  const nav = useNavigate();

  console.log("[SGA DEBUG] Usuário atual:", user?.email, "| Cargo:", user?.role);

  // Gerenciamento de estado local para UI e filtros.
  // Em produção, 'page' e 'q' poderiam ser movidos para a URL (Search Params)
  // para permitir que o usuário compartilhe links de busca.
  const [tab, setTab] = useState<(typeof tabs)[number]["k"]>("campeonatos");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  
  // Pegando dados e ações da Store Global com fallbacks de array vazio
  const {
    bracket, 
    updateMatchScore 
  } = useDataStore();

  const [tournamentsData, setTournamentsData] = useState<any[]>(tournaments);
  const [playersData, setPlayersData] = useState<any[]>(players);
  const [teamsData, setTeamsData] = useState<any[]>(teams);
  const [matchesData, setMatchesData] = useState<any[]>(matches);
  const [loading, setLoading] = useState(true);
  const [isCreatingTourney, setIsCreatingTourney] = useState(false);
  const [newTourney, setNewTourney] = useState({ 
    name: "", 
    prize: "", 
    teamsCount: 16, 
    startDate: "", 
    endDate: "",
    game: "COUNTER-STRIKE 2",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
  });

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    tag: "",
    elo: 1000,
    game: "COUNTER-STRIKE 2",
    bannerColor: "#f86d83"
  });

  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    nick: "",
    name: "",
    role: "Duelista",
    teamId: "",
    avatar: "https://picsum.photos/seed/sga/200/200"
  });
  const getTournaments = useApiController("Tournaments");
  const createTournament = useApiController("Tournaments");
  const getPlayers = useApiController("Players");
  const createPlayer = useApiController("Players");
  const getTeams = useApiController("Teams");
  const createTeam = useApiController("Teams");
  const getMatches = useApiController("Matches");
  const updateMatch = useApiController("Matches");
  const createMatch = useApiController("Matches");
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    tournamentId: "",
    teamAId: "",
    teamBId: "",
    startsAt: "",
    map: "Mirage",
    status: "Agendada",
    scoreA: 0,
    scoreB: 0,
    bracketPosition: "" // Identificador do slot no chaveamento (vazio para partidas comuns)
  });

  // Efeito para buscar campeonatos e jogadores do backend
  useEffect(() => {
    const load = async () => {
      try {
        const [tourneyRes, playerRes, teamRes, matchRes] = await Promise.all([
          getTournaments.getAll(),
          getPlayers.getAll(),
          getTeams.getAll(),
          getMatches.getAll()
        ]);

        if (Array.isArray(tourneyRes)) setTournamentsData(tourneyRes);
        if (Array.isArray(playerRes)) setPlayersData(playerRes);
        if (Array.isArray(teamRes)) setTeamsData(teamRes);
        if (Array.isArray(matchRes)) setMatchesData(matchRes);

      } catch (err) {
        console.error("Erro ao carregar dados do painel:", err);
        setTournamentsData(tournaments || []);
        setPlayersData(players || []);
        setTeamsData(teams || []);
        setMatchesData(matches || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sincroniza o campeonato selecionado assim que os dados carregarem
  const [selectedTourney, setSelectedTourney] = useState("");

  useEffect(() => {
    if (tournamentsData.length > 0 && !selectedTourney) {
      setSelectedTourney(tournamentsData[0].id);
    }
  }, [tournamentsData, selectedTourney]);

  // Guard de Autenticação Admin - Verificação dinâmica por Role (Administrador)
  // Posicionado após TODOS os Hooks para evitar o erro "Rendered more hooks than during the previous render"
  if (!user || user.role !== "Administrador") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#06070a] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md border border-white/5 bg-[#0a0a0c]/80 p-10 backdrop-blur-xl relative group shadow-2xl"
        >
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-primary group-hover:w-10 group-hover:h-10 transition-all" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-primary group-hover:w-10 group-hover:h-10 transition-all" />
          
          <ShieldAlert className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
          <h1 className="font-display text-4xl font-black italic uppercase text-white mb-4 tracking-tighter">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-8 uppercase tracking-[0.2em] text-[10px] italic leading-relaxed">
            Identificação de nível Administrador necessária para acessar o núcleo de comando_ <br/>
            <span className="text-[8px] opacity-30 mt-2 block">Terminal restrito a usuários com permissão de gestão via API.</span>
          </p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 w-full h-12 uppercase tracking-[0.2em] font-black italic shadow-neon">
              Autenticar Terminal
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
  function HeaderBar({ create, onCreate }: { create: string; onCreate?: () => void }) {
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filtrar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" onClick={fakeAct("Upload realizado")}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
        <Button className="bg-neon shadow-neon" onClick={onCreate || (create.includes("partida") ? () => setIsCreatingMatch(true) : () => setIsCreatingTourney(true))}><Plus className="h-4 w-4 mr-1" /> {create}</Button>
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
        <StatsCard label="Campeonatos" value={tournamentsData.length} icon={Trophy} accent />
        <StatsCard label="Times" value={teamsData.length} icon={Users} />
        <StatsCard label="Jogadores" value={playersData.length} icon={Activity} />
        <StatsCard label="Partidas" value={matchesData.length} icon={Swords} />
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
          const f = filt(tournamentsData, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingTourney && (
                <div className="mb-8 p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-primary">Configurar Novo Campeonato</h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nome</label>
                      <Input placeholder="Título do Evento" value={newTourney.name} onChange={e => setNewTourney({...newTourney, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Premiação</label>
                      <Input placeholder="Ex: R$ 5.000" value={newTourney.prize} onChange={e => setNewTourney({...newTourney, prize: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Vagas</label>
                      <Input type="number" value={newTourney.teamsCount} onChange={e => setNewTourney({...newTourney, teamsCount: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Início</label>
                      <Input type="date" value={newTourney.startDate} onChange={e => setNewTourney({...newTourney, startDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Término</label>
                      <Input type="date" value={newTourney.endDate} onChange={e => setNewTourney({...newTourney, endDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Jogo</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={newTourney.game} 
                        onChange={e => setNewTourney({...newTourney, game: e.target.value})}
                      >
                        <option value="COUNTER-STRIKE 2">CS2</option>
                        <option value="VALORANT">VALORANT</option>
                        <option value="LEAGUE OF LEGENDS">LoL</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingTourney(false)}>Cancelar</Button>
                    <Button className="bg-primary" onClick={async () => {
                      try {
                        await createTournament.create(newTourney);
                        toast.success("Campeonato criado com sucesso!");
                        setIsCreatingTourney(false);
                        const res = await getTournaments.getAll();
                        if (Array.isArray(res)) setTournamentsData(res);
                      } catch (err: any) {
                        console.error("Erro detalhado da API:", err);
                        toast.error(err.message || "Erro ao criar campeonato");
                      }
                    }}>Salvar</Button>
                  </div>
                </div>
              )}
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
                        <td className="text-center">{formatDateBR(t.startDate)}</td>
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

        {tab === "chaveamentos" && (
          <div className="animate-in fade-in duration-700 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">Gestão de <span className="text-primary">Chaveamentos</span></h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic mt-1">Playoff_Matrix_Control // Protocol_9.9</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
              {/* Lista de Seleção */}
              <div className="space-y-4">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Tournament_Stream</span>
                <div className="grid gap-2">
                  {tournamentsData.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTourney(t.id)}
                      className={`p-4 text-left border transition-all relative group ${selectedTourney === t.id ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(248,109,131,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                    >
                      <div className="text-sm font-display uppercase italic font-bold tracking-tight">{t.name}</div>
                      <div className="flex items-center justify-between mt-1">
                         <StatusBadge status={t.status as any} />
                      </div>
                      {selectedTourney === t.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace do Editor */}
              <div className="bg-[#0a0a0c]/60 backdrop-blur-md border border-white/5 p-8 relative">
                 <div className="flex flex-col gap-12">
                    {/* QUARTAS */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic flex items-center gap-3">
                        <div className="w-8 h-px bg-primary/40" /> 01. Quartas de Final
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                         {[1,2,3,4].map(matchIdx => {
                           const pos = `QF-${matchIdx}`;
                           const m = matchesData.find(md => md.tournamentId === selectedTourney && md.bracketPosition === pos);
                           
                           const saveSlot = async (data: any) => {
                             try {
                               if (m?.id) await updateMatch.update(m.id, { ...m, ...data });
                               else await createMatch.create({ ...data, tournamentId: selectedTourney, bracketPosition: pos, status: "Agendada", startsAt: new Date().toISOString(), map: "TBD" });
                               
                               const res = await getMatches.getAll();
                               if (Array.isArray(res)) setMatchesData(res);
                               toast.success(`Slot ${pos} atualizado`);
                             } catch (err) {
                               toast.error("Erro ao salvar bracket");
                             }
                           };

                           return (
                           <div key={matchIdx} className="bg-white/5 p-4 border border-white/10 group/match hover:border-primary/40 transition-all relative">
                              <div className="flex justify-between items-center mb-4">
                                 <span className="text-[8px] font-black text-white/30 tracking-widest uppercase">Slot {pos}</span>
                                 <Save className="w-3 h-3 text-white/10" />
                              </div>
                              <div className="space-y-3">
                                 <div className="flex items-center gap-3">
                                    <select 
                                      className="flex-1 bg-black border border-white/10 text-[10px] font-black p-1 uppercase focus:border-primary outline-none"
                                      value={m?.teamAId || ""}
                                      onChange={e => saveSlot({ teamAId: e.target.value })}
                                    >
                                      <option>Selecionar Time A</option>
                                      {teamsData.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                                    </select>
                                    <Input 
                                      className="w-12 h-7 text-center text-xs font-black bg-black border-white/10" 
                                      value={m?.scoreA || 0}
                                      onChange={e => saveSlot({ scoreA: parseInt(e.target.value) || 0 })}
                                    />
                                 </div>
                                 <div className="flex items-center gap-4 py-1">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-[8px] font-black text-white/10 italic tracking-tighter">VERSUS</span>
                                    <div className="h-px flex-1 bg-white/5" />
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <select 
                                      className="flex-1 bg-black border border-white/10 text-[10px] font-black p-1 uppercase focus:border-primary outline-none"
                                      value={m?.teamBId || ""}
                                      onChange={e => saveSlot({ teamBId: e.target.value })}
                                    >
                                      <option>Selecionar Time B</option>
                                      {teamsData.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                                    </select>
                                    <Input 
                                      className="w-12 h-7 text-center text-xs font-black bg-black border-white/10" 
                                      value={m?.scoreB || 0}
                                      onChange={e => saveSlot({ scoreB: parseInt(e.target.value) || 0 })}
                                    />
                                 </div>
                              </div>
                           </div>
                         )})}
                      </div>
                    </div>

                    {/* SEMIFINAIS */}
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-neon uppercase tracking-[0.4em] italic flex items-center gap-3">
                         <div className="w-8 h-px bg-neon/40" /> 02. Semifinais
                       </h4>
                       <div className="grid md:grid-cols-2 gap-4">
                          {[1,2].map(sfIdx => (
                            <div key={sfIdx} className="bg-neon/5 p-4 border border-neon/10 hover:border-neon/40 transition-all">
                              <div className="text-[8px] font-black text-neon/40 tracking-widest uppercase mb-3 text-center">Semi Final SF-0{sfIdx}</div>
                              <div className="flex flex-col gap-2">
                                 <div className="flex items-center justify-between text-[10px] text-white/40 font-bold px-2">
                                   <span className="uppercase">Vencedor QF-0{sfIdx*2-1}</span>
                                   <Input className="w-10 h-6 text-center text-[10px] font-black border-white/10" defaultValue="0" />
                                 </div>
                                 <div className="flex items-center justify-between text-[10px] text-white/40 font-bold px-2">
                                   <span className="uppercase">Vencedor QF-0{sfIdx*2}</span>
                                   <Input className="w-10 h-6 text-center text-[10px] font-black border-white/10" defaultValue="0" />
                                 </div>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {tab === "times" && (() => {
          const f = filt(teamsData, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingTeam && (
                <div className="mb-8 p-6 border border-neon/20 bg-neon/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-neon">Registrar Nova Equipe</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nome da Equipe</label>
                      <Input placeholder="Ex: Pulse Elite" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">TAG</label>
                      <Input placeholder="Ex: PULSE" value={newTeam.tag} onChange={e => setNewTeam({...newTeam, tag: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Jogo</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={newTeam.game} 
                        onChange={e => setNewTeam({...newTeam, game: e.target.value})}
                      >
                        <option value="COUNTER-STRIKE 2">CS2</option>
                        <option value="VALORANT">VALORANT</option>
                        <option value="LEAGUE OF LEGENDS">LoL</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Cor do Banner</label>
                      <Input type="color" className="h-10 p-1" value={newTeam.bannerColor} onChange={e => setNewTeam({...newTeam, bannerColor: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingTeam(false)}>Cancelar</Button>
                    <Button className="bg-neon text-black font-black" onClick={async () => {
                      try {
                        if(!newTeam.name || !newTeam.tag) throw new Error("Nome e TAG são obrigatórios.");
                        await createTeam.create(newTeam);
                        toast.success("Equipe registrada!");
                        setIsCreatingTeam(false);
                        const res = await getTeams.getAll();
                        if (Array.isArray(res)) setTeamsData(res);
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao registrar time");
                      }
                    }}>Finalizar Registro</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Novo time" onCreate={() => setIsCreatingTeam(true)} />
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
          const f = filt(playersData, "nick");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingPlayer && (
                <div className="mb-8 p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-primary">Contratar Novo Atleta</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nick</label>
                      <Input placeholder="Nome de guerra" value={newPlayer.nick} onChange={e => setNewPlayer({...newPlayer, nick: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nome Real</label>
                      <Input placeholder="Nome civil" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Função</label>
                      <Input placeholder="Ex: IGL, AWP" value={newPlayer.role} onChange={e => setNewPlayer({...newPlayer, role: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Equipe</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={newPlayer.teamId} 
                        onChange={e => setNewPlayer({...newPlayer, teamId: e.target.value})}
                      >
                        <option value="">Sem Equipe</option>
                        {teamsData.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingPlayer(false)}>Cancelar</Button>
                    <Button className="bg-primary font-black" onClick={async () => {
                      try {
                        if(!newPlayer.nick) throw new Error("O Nick é obrigatório.");
                        await createPlayer.create(newPlayer);
                        toast.success("Jogador contratado!");
                        setIsCreatingPlayer(false);
                        const res = await getPlayers.getAll();
                        if (Array.isArray(res)) setPlayersData(res);
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao criar jogador");
                      }
                    }}>Salvar Perfil</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Novo jogador" onCreate={() => setIsCreatingPlayer(true)} />
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
          const f = filt(matchesData, "status");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingMatch && (
                <div className="mb-8 p-6 border border-secondary/20 bg-secondary/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-secondary">Agendar Novo Confronto</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Campeonato</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.tournamentId} onChange={e => setNewMatch({...newMatch, tournamentId: e.target.value})}>
                        <option value="">Selecionar...</option>
                        {tournamentsData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Time A</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.teamAId} onChange={e => setNewMatch({...newMatch, teamAId: e.target.value})}>
                        <option value="">Selecionar...</option>
                        {teamsData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Time B</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.teamBId} onChange={e => setNewMatch({...newMatch, teamBId: e.target.value})}>
                        <option value="">Selecionar...</option>
                        {teamsData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Horário</label>
                      <Input type="datetime-local" value={newMatch.startsAt} onChange={e => setNewMatch({...newMatch, startsAt: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingMatch(false)}>Cancelar</Button>
                    <Button className="bg-secondary text-black font-black" onClick={async () => {
                      try {
                        if(!newMatch.tournamentId || !newMatch.teamAId || !newMatch.teamBId) throw new Error("Preencha os campos obrigatórios");
                        await createMatch.create(newMatch);
                        toast.success("Partida agendada!");
                        setIsCreatingMatch(false);
                        const res = await getMatches.getAll();
                        if (Array.isArray(res)) setMatchesData(res);
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao agendar partida");
                      }
                    }}>Confirmar Agenda</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Nova partida" onCreate={() => setIsCreatingMatch(true)} />
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
