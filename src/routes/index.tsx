import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Swords, Flame, ChevronRight, Crown, Medal, Award } from "lucide-react";
import { tournaments as mockTournaments, matches as mockMatches, lastTournament, teams as mockTeams } from "@/mocks/data";
import { TournamentCard } from "@/components/sga/TournamentCard";
import { MatchCard } from "@/components/sga/MatchCard";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { RankingTable } from "@/components/sga/RankingTable";
import { PlayerStatsTable } from "@/components/sga/PlayerStatsTable";
import { StatsCard } from "@/components/sga/StatsCard";
import { Button } from "@/components/ui/button";
import useApiController from "../API/controler";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SGA — Santos Games Arena | CS2, Valorant & CS" },
      { name: "description", content: "Campeonatos, ranking e partidas ao vivo de CS2, Valorant e CS na plataforma oficial da Santos Games Arena." },
    ],
  }),
  component: Home,
});

function Section({ title, index, action, children, id, alternate }: { title: string; index: string; action?: React.ReactNode; children: React.ReactNode; id?: string; alternate?: boolean }) {
  return (
    <section id={id} className={`py-24 relative border-t border-white/5 ${alternate ? "bg-[#06070a]" : "bg-background"}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle grid background for all sections */}
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
        
        {alternate ? (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_20%,rgba(255,70,85,0.04),transparent_40%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_80%,rgba(255,85,0,0.03),transparent_40%)]" />
            {/* Animated Scanning Line */}
            <motion.div 
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent_50%)]" />
        )}
        
        {/* Noise Overlay global para Sections */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Background Decor Index */}
      <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none select-none hidden lg:block z-0">
        <div className="font-display text-[12rem] font-black italic leading-none">{index}</div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 italic mt-1.5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              {index}
            </div>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter italic font-black leading-none text-white drop-shadow-sm">
              {title.split(' ')[0]} <span className="text-primary/90">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [rankingGame, setRankingGame] = useState<"COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS">("COUNTER-STRIKE 2");
  const [playerStatsGame, setPlayerStatsGame] = useState<"COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS">("COUNTER-STRIKE 2");

  // Estados locais para dados vindos do banco de dados
  const [tournaments, setTournaments] = useState<any[]>(mockTournaments);
  const [matches, setMatches] = useState<any[]>(mockMatches);
  const [teams, setTeams] = useState<any[]>(mockTeams);
  const [loading, setLoading] = useState(true);
  const getTournaments = useApiController("Tournaments");
  const getMatches = useApiController("Matches");
  const getTeams = useApiController("Teams");

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const [tRes, mRes, tmRes] = await Promise.all([
          getTournaments.getAll(),
          getMatches.getAll(),
          getTeams.getAll()
        ]);

        // Só atualiza se a resposta for um array válido
        if (Array.isArray(tRes)) setTournaments(tRes);
        if (Array.isArray(mRes)) setMatches(mRes);
        if (Array.isArray(tmRes)) setTeams(tmRes);

      } catch (err) {
        console.error("Erro ao sincronizar Home com o servidor:", err);
      } finally {
        setLoading(false);
      }
    };

    syncWithBackend();
  }, []);

  // Filtros derivados dos estados sincronizados
  const live = useMemo(() => matches.filter((m) => m.status === "Ao vivo").slice(0, 4), [matches]);
  const upcoming = useMemo(() => matches.filter((m) => m.status === "Agendada").slice(0, 6), [matches]);

  // Configuração dos cards informativos que irão rotacionar no Hero
  const infoCards = [
    {
      type: "TORNEIO ATIVO",
      title: tournaments[0]?.name || "Carregando Evento...",
      status: "Em Andamento",
      banner: tournaments[0]?.banner || mockTournaments[0].banner,
      stats: [
        { label: "Premiação Total", value: tournaments[0]?.prize || "..." },
        { label: "Vagas", value: tournaments[0] ? `${tournaments[0].teamsCount} / 16 Equipes` : "..." }
      ]
    },
    {
      type: "HALL OF FAME",
      title: "Elite da Temporada",
      status: "SGA Season 2024.1",
      banner: "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg",
      stats: [
        { label: "Equipe Alpha", value: teams[6]?.name || teams[0]?.name || "Pulse Elite" },
        { label: "MVP Global", value: "Pulse.X" }
      ]
    },
    {
      type: "ESTATÍSTICAS",
      title: "Domínio Global",
      status: "Servidores Ativos",
      banner: "https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-47eb328eac5ddd63ebd096ded7d0d5ab",
      stats: [
        { label: "Agentes Ativos", value: "14.2k" },
        { label: "Partidas Hoje", value: "842" }
      ]
    }
  ];

  const currentInfo = infoCards[heroIndex];

  const heroImages = [
    "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/67fbd4c273f3d5e92a18666c6379db09e74b7cda-1920x1080.jpg?accountingTag=VAL&auto=format&fit=fill&q=80&w=1541",
    "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg",
    "https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-47eb328eac5ddd63ebd096ded7d0d5ab"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div>
      {/* HERO - Matte Refactor */}
      <section className="relative overflow-hidden border-b border-border/60 bg-[#0a0a0c]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={heroIndex}
              src={heroImages[heroIndex]} 
              alt="" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>

        <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest text-primary-foreground italic">
              <Flame className="h-3.5 w-3.5" /> A Arena Multigame Definitiva
            </div>
            <h1 className="mt-4 font-display text-2xl sm:text-5xl md:text-7xl leading-[1.1] md:leading-[1.2] uppercase italic font-black tracking-wide break-words">
              Domine o <span className="text-cs2">CS2</span>, <br/>
              <span className="text-valorant">Valorant</span> e <span className="text-lol">LoL</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg text-lg">
              A casa do e-sport competitivo. Participe de torneios, suba no ranking e conquiste sua glória nos maiores títulos da atualidade.
            </p>
            <div className="mt-8 flex items-center gap-10 opacity-50">
              <img src="https://tipspace.gg/images/cs2/cs2-logo.webp" alt="CS2" className="h-7 w-auto" title="Counter-Strike 2" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Valorant_pink_version_logo.svg/3840px-Valorant_pink_version_logo.svg.png" alt="VALORANT" className="h-5 w-auto" title="Valorant" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/League_of_Legends_2019_vector.svg" alt="LoL" className="h-8 w-auto" title="League of Legends" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 px-8 h-12 uppercase tracking-widest font-black italic">
                  Participar agora <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/bracket">
                <Button variant="outline" className="h-12 px-8 uppercase tracking-widest font-bold border-white/20 hover:bg-white/5 italic">
                  Ver chaveamento
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 xs:grid-cols-3 gap-4 max-w-md">
              <StatsCard label="Times" value="8" icon={Users} />
              <StatsCard label="Partidas" value={matches.length} icon={Swords} accent />
              <StatsCard label="Prêmios" value="R$ 123k" icon={Trophy} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:pl-10">
            
            <motion.div whileHover="hover" className="relative group">
              {/* Molduras táticas nos cantos */}
              <motion.div 
                variants={{ hover: { x: -5, y: -5 } }}
                className="absolute -top-[2px] -left-[2px] w-12 h-12 border-t-2 border-l-2 border-primary z-20 transition-all duration-500 group-hover:w-16 group-hover:h-16" 
              />
              <motion.div 
                variants={{ hover: { x: 5, y: 5 } }}
                className="absolute -bottom-[2px] -right-[2px] w-12 h-12 border-b-2 border-r-2 border-primary z-20 transition-all duration-500 group-hover:w-16 group-hover:h-16" 
              />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 z-20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20 z-20" />

              <AnimatePresence mode="wait">
                <motion.div 
                  key={heroIndex}
                  initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                  variants={{ hover: { scale: 1.02 } }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 90, 
                    damping: 20,
                    mass: 1 
                  }}
                  className="relative overflow-hidden border border-white/10 bg-[#0a0a0c] shadow-2xl transition-[border-color,box-shadow] duration-500 group-hover:border-primary/40 group-hover:shadow-[0_0_50px_rgba(248,109,131,0.2)] cursor-pointer"
                >
                  {/* Image with zoom effect and lower opacity for contrast */}
                  <motion.img 
                    src={currentInfo.banner} 
                    alt={currentInfo.title} 
                    variants={{ hover: { scale: 1.1 } }}
                    transition={{ duration: 0.6 }}
                    className="w-full aspect-video object-cover opacity-50" 
                  />
                  
                  {/* Technical Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  
                  {/* Content Container */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    {/* Status Indicator */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2.5 mb-4"
                    >
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(248,109,131,0.6)]"></span>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">{currentInfo.type} // {currentInfo.status}</div>
                    </motion.div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-display text-2xl sm:text-4xl md:text-5xl italic font-black uppercase tracking-tight text-white leading-[1.1] mb-4 md:mb-6 group-hover:text-primary transition-colors duration-300"
                    >
                      {currentInfo.title}
                    </motion.h3>
                    
                    {/* Data Grid */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10"
                    >
                      {currentInfo.stats.map((stat, i) => (
                        <div key={i} className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black italic">{stat.label}</span>
                          <div className={`font-display text-2xl ${i === 0 ? 'text-primary' : 'text-white'} italic font-black leading-none`}>{stat.value}</div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                  
                  {/* Accent Line */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 01: AGENDA DA ARENA (PRÓXIMAS E AO VIVO) */}
      <Section index="01" title="Arena em Ação" alternate>
        <div className="relative p-6 md:p-10 border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-sm overflow-hidden">
          {/* Inner Section Background */}
          <div className="absolute inset-0 grid-bg opacity-[0.03]" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12">
            {/* COLUNA ESQUERDA: PARTIDAS AO VIVO */}
            <div className="space-y-6">
              <div className="flex items-center border-b border-white/10 pb-4">
                <h3 className="font-display text-xl uppercase italic font-black tracking-tight text-primary">
                  Live Hub
                </h3>
                <div className="ml-3 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(248,109,131,0.5)]"></span>
                </div>
              </div>
              <div className="grid gap-4">
                {live.length > 0 ? (
                  live.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} />)
                ) : (
                  <div className="h-[280px] flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] text-muted-foreground text-[10px] uppercase tracking-[0.3em] italic text-center px-6">Buscando transmissões ativas...</div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA: PRÓXIMAS PARTIDAS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-display text-xl uppercase italic font-black tracking-tight">
                  Schedule_Next
                </h3>
                <Link to="/matches" className="text-[10px] font-bold text-primary hover:text-white uppercase tracking-widest italic transition-colors">Full Agenda →</Link>
              </div>
              <div className="grid gap-4">
                {upcoming.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} />)}
              </div>
            </div>
          </div>
          
          {/* HUD Brackets Decor */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
        </div>
      </Section>

      {/* CAMPEONATOS ABERTOS */}
      <Section index="02" title="Campeonatos Abertos">
        <div className="relative group">
          {/* Background Text Depth */}
          <div className="absolute -top-24 left-0 font-display text-[14rem] font-black italic text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase">
            Events
          </div>
          
          <div className="mb-12 border-l-4 border-primary pl-6 md:pl-10 relative z-10">
            <h3 className="font-display text-3xl md:text-5xl uppercase leading-[1.1] tracking-tighter text-white">
              A arena dos <span className="text-primary">campeões</span> <br />
              te espera.
            </h3>
            <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-2xl leading-relaxed">
              Participe dos torneios oficiais e conquiste prêmios exclusivos na maior infraestrutura de e-sports da região.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {tournaments.map((t) => <TournamentCard key={t.id} t={t as any} />)}
          </div>
        </div>
      </Section>

      {/* HALL OF FAME - MULTI-GAME SHOWCASE */}
      <Section 
        index="03" 
        title="Hall da Fama" 
        alternate 
        action={<Link to="/tournaments" className="text-xs font-bold text-primary hover:text-white uppercase tracking-[0.2em] italic transition-colors">Ver todos os campeões →</Link>}
      >
        <div className="relative overflow-hidden border border-white/10 bg-[#06070a] shadow-2xl rounded-sm">
          {/* Cinematic Background Layers */}
          <div className="absolute inset-0 grid-bg opacity-[0.08]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(248,109,131,0.15),transparent_70%)] animate-pulse duration-[8s]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#06070a]/80 to-[#06070a]" />
          
          {/* Noise/Grain Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* Tactical Hud Lines Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />
          
          {/* Animated Scanning Line Effect */}
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0"
          />

          <div className="relative z-10 p-6 md:p-14">
            <div className="text-center mb-20 relative">
              {/* Depth Background Text for cinematic feel */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[12rem] md:text-[22rem] font-black italic text-white/[0.015] select-none pointer-events-none -z-10 tracking-tighter uppercase">
                Elite
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -z-10" />
              
              <div className="relative inline-flex items-center gap-3 px-4 py-1.5 bg-warning/10 text-warning text-[10px] font-black uppercase tracking-[0.4em] italic mb-6 border border-warning/20 backdrop-blur-sm">
                <Award className="h-3 w-3" /> HALL OF CHAMPIONS
              </div>
              
              <h3 className="font-display text-5xl sm:text-7xl md:text-9xl italic font-black uppercase tracking-tighter leading-none text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6">
                ELITE DA <span className="text-primary">ARENA</span>
              </h3>
              <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.6em] text-muted-foreground/40">
                <div className="h-px w-12 bg-white/5" />
                <span>SANTOS GAMES ARENA // SEASON 2024.1</span>
                <div className="h-px w-12 bg-white/5" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center md:items-end max-w-6xl mx-auto mt-10">
            {[
              { game: "VALORANT", team: teams[0], tourney: "VCT Ribeirão A", icon: Medal, height: "h-80", border: "border-valorant/20", bg: "bg-valorant/5", color: "text-valorant", banner: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/67fbd4c273f3d5e92a18666c6379db09e74b7cda-1920x1080.jpg", mvp: "SGA.Breno" },
              { game: "COUNTER-STRIKE 2", team: teams[6], tourney: "CS Prime RP", icon: Crown, height: "h-[28rem]", border: "border-cs2/20", bg: "bg-cs2/5", color: "text-cs2", banner: "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg", mvp: "Pulse.X" },
              { game: "LEAGUE OF LEGENDS", team: teams[1], tourney: "SGA League RP", icon: Award, height: "h-72", border: "border-lol/20", bg: "bg-lol/5", color: "text-lol", banner: "https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-47eb328eac5ddd63ebd096ded7d0d5ab", mvp: "RibeirãoKing" },
            ].map(({ game, team, tourney, icon: Icon, height, border, bg, color, banner, mvp }) => (
              <motion.div 
                key={game} 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative group ${bg} border ${border} p-6 md:p-10 text-center transition-all hover:bg-white/[0.03] hover:border-primary/50 overflow-hidden shadow-2xl rounded-none cursor-pointer`}
              >
                {/* Tactical Ambient Background */}
                <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-700 grayscale group-hover:grayscale-0">
                  <img src={banner} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>

                {/* Technical HUD Borders */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 group-hover:border-primary transition-colors" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 group-hover:border-primary transition-colors" />
                <div className="absolute top-4 right-4 text-[7px] font-black text-white/10 uppercase tracking-widest group-hover:text-white/40 transition-colors hidden sm:block">
                  SGA_SYS // CHAMP_SESSION
                </div>
                
                <div className={`mx-auto h-auto md:${height} flex flex-col items-center justify-end relative z-10 transition-transform duration-500`}>
                  {/* Floating Trophy Icon with Pulse */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 mb-10">
                    <div className={`relative ${game.includes("STRIKE") ? "scale-125" : "scale-100"}`}>
                      <Icon className={`h-16 w-16 ${color} filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-20 group-hover:opacity-100 transition-all duration-700`} />
                      <div className={`absolute inset-0 ${color.replace('text-', 'bg-')}/10 blur-2xl rounded-full animate-pulse -z-10`} />
                    </div>
                  </div>

                  {/* Logo with Glow Effect */}
                  <div className="relative mb-8">
                    <div className={`absolute inset-0 ${color.replace('text-', 'bg-')}/30 blur-[80px] rounded-full scale-150 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                    <TeamLogo team={team} size={game.includes("STRIKE") ? 160 : 130} />
                  </div>

                  <div className="mt-6">
                    <div className={`text-[10px] font-black uppercase tracking-[0.5em] ${color} mb-2 italic`}>{game}</div>
                    <div className="font-display text-4xl md:text-6xl italic font-black uppercase text-white tracking-tighter leading-none group-hover:text-primary transition-all duration-300 drop-shadow-lg">{team.name}</div>
                  </div>

                  <div className="flex flex-col items-center mt-8 gap-3">
                    <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">
                      {tourney}
                    </div>
                    <div className="px-5 py-2 bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors shadow-xl">
                      <span className="text-[9px] font-black text-white/30 uppercase italic group-hover:text-primary/50 transition-colors">MVP:</span>
                      <span className="text-[12px] font-black text-white uppercase italic tracking-widest">{mvp}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </Section>

      {/* RANKING DOS 8 TIMES */}
      <Section index="04" title="Ranking de Equipes" action={<Link to="/teams" className="text-xs font-bold text-primary hover:text-white uppercase tracking-[0.2em] italic">Ver todos os times →</Link>}>
        <div className="flex gap-8 mb-8 items-center border-b border-white/5 pb-4">
          {[
            { id: "COUNTER-STRIKE 2" as const, label: "CS2", color: "text-cs2" },
            { id: "VALORANT" as const, label: "VLR", color: "text-valorant" },
            { id: "LEAGUE OF LEGENDS" as const, label: "LoL", color: "text-lol" },
          ].map((game) => (
            <button
              key={game.id}
              onClick={() => setRankingGame(game.id)}
              className={`font-display text-xl sm:text-3xl italic font-black uppercase tracking-tighter transition-all relative py-2 ${
                rankingGame === game.id 
                  ? `${game.color} opacity-100 scale-110` 
                  : "text-muted-foreground opacity-40 hover:opacity-70"
              }`}
            >
              {game.label}
              {rankingGame === game.id && (
                <motion.div layoutId="rankTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current" />
              )}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={rankingGame}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <RankingTable game={rankingGame} />
          </motion.div>
        </AnimatePresence>
      </Section>

      <Section index="05" title="Top 40 Jogadores" alternate action={<Link to="/players" className="text-xs font-bold text-primary hover:text-white uppercase tracking-[0.2em] italic">Ranking completo →</Link>}>
        <div className="flex gap-8 mb-8 items-center border-b border-white/5 pb-4">
          {[
            { id: "COUNTER-STRIKE 2" as const, label: "CS2", color: "text-cs2" },
            { id: "VALORANT" as const, label: "VLR", color: "text-valorant" },
            { id: "LEAGUE OF LEGENDS" as const, label: "LoL", color: "text-lol" },
          ].map((game) => (
            <button
              key={game.id}
              onClick={() => setPlayerStatsGame(game.id)}
              className={`font-display text-xl sm:text-3xl italic font-black uppercase tracking-tighter transition-all relative py-2 ${
                playerStatsGame === game.id 
                  ? `${game.color} opacity-100 scale-110` 
                  : "text-muted-foreground opacity-40 hover:opacity-70"
              }`}
            >
              {game.label}
              {playerStatsGame === game.id && (
                <motion.div layoutId="playerStatsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current" />
              )}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={playerStatsGame}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="border border-border/40 bg-card/10"
          >
            <PlayerStatsTable limit={10} game={playerStatsGame} />
          </motion.div>
        </AnimatePresence>
      </Section>

    </div>
  );
}
