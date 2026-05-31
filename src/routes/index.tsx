import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, Users, Swords, Flame, ChevronRight, Crown, Medal, Award } from "lucide-react";
import { TournamentCard } from "@/components/sga/TournamentCard";
import { MatchCard } from "@/components/sga/MatchCard";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { RankingTable } from "@/components/sga/RankingTable";
import { PlayerStatsTable } from "@/components/sga/PlayerStatsTable";
import { AnimatedStatsCard } from "@/components/sga/AnimatedStatsCard";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);
import useApiController from "../API/controler";
import { unwrapList } from "@/lib/api";
import { buildPublicMatches } from "@/lib/publicApi";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: ogMeta({
      title: "SGA — Santos Games Arena | CS2, Valorant & CS",
      description: "Campeonatos, ranking e partidas ao vivo de CS2, Valorant e CS na plataforma oficial da Santos Games Arena.",
      path: "/",
    }),
  }),
  component: Home,
});

function Section({ title, index, action, children, id, alternate }: { title: string; index: string; action?: React.ReactNode; children: React.ReactNode; id?: string; alternate?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const numRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true,
      },
    })

    // número decorativo entra deslizando da direita
    if (numRef.current) {
      gsap.set(numRef.current, { x: 60, opacity: 0 })
      tl.to(numRef.current, { x: 0, opacity: 0.025, duration: 0.9, ease: 'power3.out' }, 0)
    }

    // header sobe
    if (headerRef.current) {
      gsap.set(headerRef.current, { y: 28, opacity: 0 })
      tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.1)
    }

    // conteúdo sobe com leve delay
    if (contentRef.current) {
      gsap.set(contentRef.current, { y: 20, opacity: 0 })
      tl.to(contentRef.current, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.3)
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id={id} className={`py-20 md:py-24 relative ${alternate ? "bg-[var(--surface-1)]" : "bg-background"}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.025),transparent_60%)]" />
      </div>

      {/* Numeração decorativa */}
      <div ref={numRef} className="absolute top-0 right-0 p-10 opacity-0 pointer-events-none select-none hidden lg:block z-0">
        <div className="font-display text-[12rem] font-black italic leading-none">{index}</div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 md:px-6 relative z-10">
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 opacity-0">
          <div className="flex items-start gap-4">
            <div className="bg-primary text-primary-foreground text-sm font-black px-2.5 py-1 mt-2 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              {index}
            </div>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter italic font-black leading-none text-white">
              {title.split(' ')[0]} <span className="text-primary/90">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>
          {action}
        </div>
        <div ref={contentRef} className="opacity-0">
          {children}
        </div>
      </div>
    </section>
  )
}

function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [rankingGame, setRankingGame] = useState<"COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS">("VALORANT");
  const [playerStatsGame, setPlayerStatsGame] = useState<"COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS">("VALORANT");

  const apiTournaments = useApiController("Tournaments");
  const apiMatches = useApiController("Matches");
  const apiTeams = useApiController("Teams");
  const apiMatchTeams = useApiController("Matchteams");
  const apiStatus = useApiController("Status");
  const apiStages = useApiController("Stages");

  const { data: tRaw, isLoading: loadingT } = useQuery({ 
    queryKey: ["tournaments"], 
    queryFn: () => apiTournaments.getAll({ includeAuth: false }) 
  });
  const { data: mRaw, isLoading: loadingM } = useQuery({ 
    queryKey: ["matches"], 
    queryFn: () => apiMatches.getAll({ includeAuth: false }) 
  });
  const { data: tmRaw, isLoading: loadingTeams } = useQuery({ 
    queryKey: ["teams"], 
    queryFn: () => apiTeams.getAll({ includeAuth: false }) 
  });
  const { data: mtRaw } = useQuery({
    queryKey: ["matchteams"],
    queryFn: () => apiMatchTeams.getAll({ includeAuth: false }),
  });
  const { data: srRaw } = useQuery({
    queryKey: ["status"],
    queryFn: () => apiStatus.getAll({ includeAuth: false }),
  });
  const { data: stRaw } = useQuery({
    queryKey: ["stages"],
    queryFn: () => apiStages.getAll({ includeAuth: false }),
  });

  const parse = useCallback((r: any) => unwrapList(r), []);

  const tournaments = useMemo(() => parse(tRaw), [tRaw, parse]);
  const teams = useMemo(() => parse(tmRaw), [tmRaw, parse]);
  const matches = useMemo(
    () =>
      buildPublicMatches({
        matchesRaw: mRaw,
        matchTeamsRaw: mtRaw,
        teamsRaw: tmRaw,
        tournamentsRaw: tRaw,
        statusRaw: srRaw,
        stagesRaw: stRaw,
      }),
    [mRaw, mtRaw, tmRaw, tRaw, srRaw, stRaw],
  );

  const loading = loadingT || loadingM || loadingTeams;

  // Filtros derivados dos estados sincronizados
  const live = useMemo(() => matches.filter((m) => m.status === "Ao vivo" || m.status === "Ativo").slice(0, 4), [matches]);
  const upcoming = useMemo(() => matches.filter((m) => m.status === "Agendada").slice(0, 6), [matches]);

  const heroImages = useMemo(() => [
    "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/67fbd4c273f3d5e92a18666c6379db09e74b7cda-1920x1080.jpg?accountingTag=VAL&auto=format&fit=fill&q=80&w=1541",
    "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg",
    "https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-47eb328eac5ddd63ebd096ded7d0d5ab"
  ], []);

  // Calculamos infoCards antes do guard de loading para manter a ordem dos hooks estável
  const infoCards = useMemo(() => [
    {
      type: "TORNEIO ATIVO",
      title: tournaments[0]?.name || "Carregando Evento...",
      status: "Em Andamento",
      banner: tournaments[0]?.banner || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
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
        { label: "Líder do Ranking", value: teams[0]?.name || "Pulse Elite" },
        { label: "ELO Atual", value: teams[0]?.elo || "..." }
      ]
    },
    {
      type: "SISTEMA ARENA",
      title: "Registros Oficiais",
      status: "Base de Dados Sincronizada",
      banner: "https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-47eb328eac5ddd63ebd096ded7d0d5ab",
      stats: [
        { label: "Times Filiados", value: String(teams.length) },
        { label: "Confrontos Totais", value: String(matches.length) }
      ]
    }
  ], [tournaments, teams, matches.length]);

  const currentInfo = infoCards[heroIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // O Guard de renderização deve vir por ÚLTIMO, após todos os hooks
  if (loading) return <div className="min-h-screen flex items-center justify-center font-display uppercase tracking-widest animate-pulse text-sm">Carregando...</div>;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-background">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroIndex}
              src={heroImages[heroIndex]}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1500px] px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground">
              <Flame className="h-4 w-4" /> A arena oficial dos e-sports
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-6xl md:text-7xl leading-[1.05] uppercase italic font-black tracking-tighter break-words text-white">
              Entre na arena do <span className="text-cs2">CS2</span>,<br/>
              <span className="text-valorant">Valorant</span> e <span className="text-lol">LoL</span>
            </h1>
            <p className="mt-5 text-foreground/80 max-w-lg text-base md:text-lg leading-relaxed">
              A plataforma competitiva da Santos Games. Monte seu time, dispute torneios, escale no ranking e prove que você é o melhor nos maiores títulos do momento.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-6 opacity-70">
              <img src="https://tipspace.gg/images/cs2/cs2-logo.webp" alt="CS2" className="h-7 w-auto" title="Counter-Strike 2" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Valorant_pink_version_logo.svg/3840px-Valorant_pink_version_logo.svg.png" alt="Valorant" className="h-5 w-auto" title="Valorant" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/League_of_Legends_2019_vector.svg" alt="League of Legends" className="h-8 w-auto" title="League of Legends" />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 px-8 h-12 uppercase tracking-wider font-bold text-sm">
                  Participar agora <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/bracket">
                <Button variant="outline" className="h-12 px-8 uppercase tracking-wider font-bold text-sm border-white/20 hover:bg-white/5">
                  Ver chaveamento
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-xl">
              <AnimatedStatsCard label="Times" value={teams.length} icon={Users} />
              <AnimatedStatsCard label="Partidas" value={matches.length} icon={Swords} accent />
              <AnimatedStatsCard label="Torneios" value={tournaments.length} icon={Trophy} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:pl-10">
            
            <motion.div whileHover="hover" className="relative group">
              {/* Molduras táticas nos cantos */}
              <motion.div 
                variants={{ hover: { x: -5, y: -5 } }}
                className="absolute -top-[2px] -left-[2px] w-12 h-12 border-t-2 border-l-2 border-primary z-20 hidden lg:block" 
              />
              <motion.div 
                variants={{ hover: { x: 5, y: 5 } }}
                className="absolute -bottom-[2px] -right-[2px] w-12 h-12 border-b-2 border-r-2 border-primary z-20 hidden lg:block" 
              />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20 z-20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20 z-20" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  variants={{ hover: { scale: 1.02 } }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 20,
                    mass: 1
                  }}
                  className="relative overflow-hidden border border-white/[0.08] bg-[var(--surface-2)] shadow-2xl transition-[border-color] duration-300 group-hover:border-primary/50 cursor-pointer"
                >
                  <motion.img
                    src={currentInfo.banner}
                    alt={currentInfo.title}
                    variants={{ hover: { scale: 1.08 } }}
                    transition={{ duration: 0.6 }}
                    className="w-full aspect-video object-cover opacity-45"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-2)] via-[var(--surface-2)]/70 to-transparent" />

                  <div className="absolute inset-0 p-7 md:p-8 flex flex-col justify-end">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2.5 mb-4"
                    >
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </div>
                      <div className="text-sm font-bold uppercase tracking-wider text-primary">
                        {currentInfo.type} · {currentInfo.status}
                      </div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-display text-3xl md:text-5xl italic font-black uppercase tracking-tight text-white leading-[1.05] mb-6 group-hover:text-primary transition-colors duration-300"
                    >
                      {currentInfo.title}
                    </motion.h3>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10"
                    >
                      {currentInfo.stats.map((stat, i) => (
                        <div key={i} className="space-y-1.5">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{stat.label}</span>
                          <div className={`font-display text-2xl md:text-3xl ${i === 0 ? 'text-primary' : 'text-white'} italic font-black leading-none`}>
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 01: AGENDA DA ARENA */}
      <Section index="01" title="Arena em Ação" alternate>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* COLUNA ESQUERDA: AO VIVO */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <h3 className="font-display text-2xl md:text-3xl uppercase italic font-black tracking-tight text-primary">
                Ao Vivo
              </h3>
              <div className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </div>
              <span className="ml-auto text-sm font-bold text-muted-foreground">
                {live.length} {live.length === 1 ? "partida" : "partidas"}
              </span>
            </div>
            <div className="grid gap-4">
              {live.length > 0 ? (
                live.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} />)
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center gap-2 ds-card text-center px-6">
                  <div className="text-base font-bold text-foreground/80">Nenhuma partida ao vivo</div>
                  <div className="text-sm text-muted-foreground">Volte mais tarde para acompanhar as transmissões.</div>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: PRÓXIMAS PARTIDAS */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
              <h3 className="font-display text-2xl md:text-3xl uppercase italic font-black tracking-tight text-white">
                Próximas Partidas
              </h3>
              <Link to="/matches" className="text-sm font-bold text-primary hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap">
                Ver agenda →
              </Link>
            </div>
            <div className="grid gap-4">
              {upcoming.length > 0 ? (
                upcoming.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} />)
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center gap-2 ds-card text-center px-6">
                  <div className="text-base font-bold text-foreground/80">Nenhuma partida agendada</div>
                  <div className="text-sm text-muted-foreground">Acompanhe os próximos campeonatos para ver a agenda.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* CAMPEONATOS ABERTOS */}
      <Section index="02" title="Campeonatos Abertos">
        <div className="mb-10 border-l-4 border-primary pl-5 md:pl-8">
          <h3 className="font-display text-3xl md:text-4xl uppercase leading-[1.1] tracking-tighter text-white">
            A arena dos <span className="text-primary">campeões</span> te espera
          </h3>
          <p className="text-foreground/75 mt-3 text-base md:text-lg max-w-2xl leading-relaxed">
            Participe dos torneios oficiais e conquiste prêmios exclusivos na maior infraestrutura de e-sports da região.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tournaments.length > 0 ? (
            tournaments.map((t) => <TournamentCard key={t.id} t={t as any} />)
          ) : (
            <div className="col-span-full ds-card py-16 text-center">
              <div className="text-base font-bold text-foreground/80">Nenhum campeonato aberto no momento</div>
              <div className="text-sm text-muted-foreground mt-1">Volte em breve para conferir as próximas competições.</div>
            </div>
          )}
        </div>
      </Section>

      {/* HALL DA FAMA - 3 jogos equilibrados */}
      <Section
        index="03"
        title="Hall da Fama"
        alternate
        action={<Link to="/tournaments" className="text-sm font-bold text-primary hover:text-white uppercase tracking-wide transition-colors">Ver todos os campeões →</Link>}
      >
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/15 text-warning text-xs font-bold uppercase tracking-wider mb-5 border border-warning/30">
            <Award className="h-3.5 w-3.5" /> Campeões da Temporada
          </div>
          <h3 className="font-display text-4xl sm:text-6xl md:text-7xl italic font-black uppercase tracking-tighter leading-[0.95] text-white mb-4">
            Elite da <span className="text-primary">Arena</span>
          </h3>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Os times que dominaram a temporada 2024.1 em CS2, Valorant e League of Legends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { game: "CS2", fullName: "Counter-Strike 2", team: teams[2] || teams[0], tourney: "CS Prime RP", icon: Crown, color: "text-cs2", accentBg: "bg-cs2/10", accentBorder: "hover:border-cs2/60", banner: "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg", mvp: "Pulse.X" },
            { game: "Valorant", fullName: "Valorant", team: teams[0] || teams[1], tourney: "VCT Ribeirão A", icon: Medal, color: "text-valorant", accentBg: "bg-valorant/10", accentBorder: "hover:border-valorant/60", banner: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/67fbd4c273f3d5e92a18666c6379db09e74b7cda-1920x1080.jpg", mvp: "SGA.Breno" },
            { game: "LoL", fullName: "League of Legends", team: teams[1] || teams[0], tourney: "SGA League RP", icon: Award, color: "text-lol", accentBg: "bg-lol/10", accentBorder: "hover:border-lol/60", banner: "https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-47eb328eac5ddd63ebd096ded7d0d5ab", mvp: "RibeirãoKing" },
          ].map(({ game, fullName, team, tourney, icon: Icon, color, accentBg, accentBorder, banner, mvp }) => team && (
            <motion.div
              key={game}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative ds-card ${accentBorder} overflow-hidden group cursor-pointer flex flex-col`}
            >
              {/* Banner do jogo */}
              <div className="relative h-32 overflow-hidden">
                <img src={banner} alt={fullName} className="w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--surface-2)]" />
                <div className={`absolute top-4 left-4 px-2.5 py-1 ${accentBg} ${color} text-xs font-bold uppercase tracking-wider border border-current/30`}>
                  {game}
                </div>
                <Icon className={`absolute top-4 right-4 h-7 w-7 ${color}`} />
              </div>

              {/* Conteúdo */}
              <div className="relative px-6 pb-7 pt-2 flex-1 flex flex-col items-center text-center">
                <div className="relative -mt-12 mb-5 z-10">
                  <div className={`absolute inset-0 ${color.replace('text-', 'bg-')}/20 blur-3xl rounded-full scale-150 -z-10 opacity-0 hidden md:block group-hover:opacity-100 transition-opacity duration-500`} />
                  <TeamLogo team={team} size={110} />
                </div>

                <div className={`text-xs font-bold uppercase tracking-wider ${color} mb-2`}>
                  Campeão {fullName}
                </div>
                <div className="font-display text-3xl md:text-4xl italic font-black uppercase text-white tracking-tighter leading-none group-hover:text-primary transition-colors duration-300 mb-5">
                  {team?.name || "Equipe Alpha"}
                </div>

                <div className="text-sm font-semibold text-muted-foreground mb-5">
                  {tourney}
                </div>

                <div className="mt-auto w-full pt-5 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MVP</span>
                  <span className="font-display text-base font-bold uppercase tracking-tight text-white">{mvp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* RANKING DE EQUIPES */}
      <Section index="04" title="Ranking de Equipes" action={<Link to="/teams" className="text-sm font-bold text-primary hover:text-white uppercase tracking-wide">Ver todos os times →</Link>}>
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-[var(--surface-1)] border border-white/[0.06]">
          {[
            { id: "COUNTER-STRIKE 2" as const, label: "CS2", color: "text-cs2" },
            { id: "VALORANT" as const, label: "Valorant", color: "text-valorant" },
            { id: "LEAGUE OF LEGENDS" as const, label: "LoL", color: "text-lol" },
          ].map((game) => (
            <button
              key={game.id}
              onClick={() => setRankingGame(game.id)}
              className={`relative px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                rankingGame === game.id
                  ? `${game.color} bg-[var(--surface-3)]`
                  : "text-muted-foreground hover:text-white"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <RankingTable game={rankingGame} />
          </motion.div>
        </AnimatePresence>
      </Section>

      <Section index="05" title="Top 40 Jogadores" alternate action={<Link to="/players" className="text-sm font-bold text-primary hover:text-white uppercase tracking-wide">Ranking completo →</Link>}>
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-[var(--surface-2)] border border-white/[0.06]">
          {[
            { id: "COUNTER-STRIKE 2" as const, label: "CS2", color: "text-cs2" },
            { id: "VALORANT" as const, label: "Valorant", color: "text-valorant" },
            { id: "LEAGUE OF LEGENDS" as const, label: "LoL", color: "text-lol" },
          ].map((game) => (
            <button
              key={game.id}
              onClick={() => setPlayerStatsGame(game.id)}
              className={`relative px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                playerStatsGame === game.id
                  ? `${game.color} bg-[var(--surface-3)]`
                  : "text-muted-foreground hover:text-white"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <PlayerStatsTable limit={10} game={playerStatsGame} />
          </motion.div>
        </AnimatePresence>
      </Section>

    </div>
  );
}
