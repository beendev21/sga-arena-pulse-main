import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getPlayer, matches, teams } from "@/mocks/data";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { MatchCard } from "@/components/sga/MatchCard";
import { StatsCard } from "@/components/sga/StatsCard";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Crosshair, 
  Zap, 
  ChevronLeft, 
  ShieldCheck, 
  Star,
  Activity,
  History
} from "lucide-react";

export const Route = createFileRoute("/players/$playerId")({
  component: PlayerProfilePage,
});

function PlayerProfilePage() {
  const { playerId } = Route.useParams();
  const player = getPlayer(playerId);

  if (!player) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#06070a]">
        <h1 className="font-display text-4xl font-black italic text-white uppercase">Identidade não encontrada</h1>
        <Link to="/players" className="mt-6 text-primary hover:underline uppercase tracking-widest text-xs">
          ← Voltar para a base de dados
        </Link>
      </div>
    );
  }

  // Encontrar o time do jogador (lógica baseada no mock)
  const playerTeam = teams.find(t => t.id === (player as any).teamId);
  
  // Filtrar partidas recentes onde o time do jogador participou
  const playerMatches = matches.filter(
    (m) => m.teamA.id === playerTeam?.id || m.teamB.id === playerTeam?.id
  ).slice(0, 5);

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Profile
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-12 md:py-20">
        {/* Back Link */}
        <Link to="/players" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors mb-12 italic group">
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back_to_Database
        </Link>

        <div className="grid lg:grid-cols-[450px_1fr] gap-12">
          {/* COLUNA ESQUERDA: IDENTIDADE TÁTICA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative p-8 border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">
                ID_ENCRYPTED // VERIFIED
              </div>
              
              {/* Avatar Hub */}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative w-48 h-48 border-2 border-white/5 group-hover:border-primary transition-colors duration-500 overflow-hidden">
                    <img src={player.avatar} alt={player.nick} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                </div>

                <h1 className="font-display text-5xl font-black italic text-white uppercase tracking-tighter">{player.nick}</h1>
                <div className="text-primary text-xs font-black uppercase tracking-[0.4em] mb-6 italic">{player.role}</div>

                {/* Team Badge */}
                {playerTeam && (
                  <Link to="/teams/$teamId" params={{ teamId: playerTeam.id }} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all mb-8">
                    <TeamLogo team={playerTeam} size={24} />
                    <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{playerTeam.name}</span>
                  </Link>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Nome Civil</span>
                  <span className="text-xs font-bold text-white uppercase italic">{player.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Rating de Combate</span>
                  <span className="text-xl font-display font-black text-primary italic leading-none">{player.rating}</span>
                </div>
              </div>

              {/* HUD Brackets Decor */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40" />
            </div>

            {/* Signature Move / Speciality */}
            <div className="p-6 border border-white/5 bg-primary/5">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-primary uppercase tracking-widest">Status de Prontidão</div>
                    <div className="text-[10px] font-bold text-white uppercase italic">Altamente Letal // Combat Ready</div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* COLUNA DIREITA: ANALYTICS & HISTÓRICO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard label="Kills" value={player.kills} icon={Crosshair} accent />
              <StatsCard label="Deaths" value={player.deaths} icon={Target} />
              <StatsCard label="Assists" value={player.assists} icon={Zap} />
              <StatsCard label="MVP" value="12" icon={Star} />
            </div>

            {/* Seções de Histórico com Abas Táticas */}
            <div className="space-y-8">
              {/* Partidas Recentes */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <History className="text-primary w-5 h-5" />
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">
                    Histórico de <span className="text-primary">Missões</span>
                  </h3>
                </div>
                <div className="grid gap-4">
                  {playerMatches.map((m) => (
                    <MatchCard key={m.id} m={m} />
                  ))}
                  {playerMatches.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/5 text-[10px] text-white/20 uppercase tracking-[0.4em] italic">Nenhum registro de combate encontrado_</div>
                  )}
                </div>
              </section>

              {/* Conquistas & Campeonatos */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <Trophy className="text-primary w-5 h-5" />
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">
                    Service <span className="text-primary">Record</span>
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { event: "SGA Ribeirão A", result: "Campeão", date: "MAR 2024", icon: ShieldCheck, color: "text-primary" },
                    { event: "VCT Challengers", result: "Finalista", date: "JAN 2024", icon: Trophy, color: "text-warning" },
                  ].map((award, i) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 flex items-center gap-5 group/award hover:border-primary/20 transition-all">
                      <div className={`p-3 bg-white/5 ${award.color} group-hover/award:scale-110 transition-transform`}>
                        <award.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white uppercase italic tracking-widest">{award.event}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{award.result} — {award.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}