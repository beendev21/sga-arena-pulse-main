import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { StatsCard } from "@/components/sga/StatsCard";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Crosshair, Award, Settings, User as UserIcon, Calendar, Zap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile")({ 
  head: () => ({ meta: [{ title: "Meu Perfil — SGA" }] }),
  component: ProfilePage 
});

function ProfilePage() {
  // Recupera o usuário autenticado do estado global.
  const user = useAuth((s) => s.user);

  /** 
   * Guard de Autenticação na View.
   * Engenharia: Idealmente validado no 'beforeLoad' do roteador para evitar flashes de conteúdo.
   */
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#06070a] px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-4xl font-black italic uppercase text-white mb-4">Sinal Perdido</h1>
          <p className="text-muted-foreground mb-8 uppercase tracking-widest text-[10px] italic">Acesso restrito. Identificação necessária para visualizar dados de agente_</p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 px-8 h-12 uppercase tracking-[0.2em] font-black italic">Acessar Terminal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Agent
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-16 md:py-24">
        {/* Technical Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 border-l-4 border-primary pl-6 md:pl-10 relative"
        >
          <div className="absolute -left-1 top-0 h-full w-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 italic mb-4 inline-block tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            USER_DATA_MODULE_v2.0
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Dossiê do <span className="text-primary">Agente</span>.
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-10">
          {/* Left Column: Tactical Identity Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative group"
          >
             <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-primary/40" />
             <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-primary/40" />
             
             <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 p-8 flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors duration-500">
                    <img src={user.avatar} alt={user.nick} className="w-40 h-40 object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-[8px] font-black uppercase italic tracking-widest shadow-xl">
                    Status: Online
                  </div>
                </div>
                
                <h2 className="font-display text-4xl font-black italic text-white uppercase tracking-tighter mb-1">{user.nick}</h2>
                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] mb-8 italic">{user.name}</p>
                
                <div className="w-full space-y-4 pt-8 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest text-white/40">
                    <span>Rank Global</span>
                    <span className="text-primary">#1,402</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest text-white/40">
                    <span>Nível de Acesso</span>
                    <span className="text-white">Elite Alpha</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-10 rounded-none border-white/10 hover:bg-white/5 uppercase text-[10px] font-black italic tracking-[0.2em] transition-all">
                  <Settings className="w-3.5 h-3.5 mr-2" /> Configurações
                </Button>
             </div>
          </motion.div>

          {/* Right Column: Performance Analytics */}
          <div className="space-y-10">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatsCard label="Partidas" value="142" icon={Target} accent />
              <StatsCard label="Vitórias" value="89" icon={Trophy} />
              <StatsCard label="K/D Ratio" value="1.42" icon={Crosshair} />
              <StatsCard label="Aproveitamento" value="62%" icon={Zap} />
            </motion.div>

            {/* Achievement Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-[#0a0a0c]/60 backdrop-blur-sm border border-white/5 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-[8px] font-black text-white/5 uppercase tracking-[0.4em] pointer-events-none">
                  SGA_AUTH // LOG_774
                </div>

                <h3 className="font-display text-2xl uppercase italic font-black text-white mb-10 flex items-center gap-4">
                  <span className="text-primary">/</span> Medalhas e Honrarias
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { title: "Veterano Alpha", sub: "Membro há mais de 1 ano", icon: ShieldCheck, color: "text-primary" },
                    { title: "Elite Sniper", sub: "Top 5% precisão HS", icon: Target, color: "text-cs2" },
                    { title: "MVP da Temporada", sub: "Campeão Prime RP 2023", icon: Trophy, color: "text-warning" },
                    { title: "Team Leader", sub: "Capitão em 20+ partidas", icon: Award, color: "text-lol" },
                  ].map((med, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group/med">
                      <div className={`p-4 bg-white/5 ${med.color} group-hover/med:scale-110 transition-transform duration-500`}>
                        <med.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase italic tracking-widest mb-1">{med.title}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{med.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* HUD Footer Decor */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Data de Alistamento</span>
                    <span className="text-[10px] font-bold text-white/60 uppercase italic">15_JAN_2023</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sincronização de Dados</span>
                    <span className="text-[10px] font-bold text-success uppercase italic">Ativa // 100%</span>
                  </div>
                </div>
              </div>
              
              {/* HUD Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}