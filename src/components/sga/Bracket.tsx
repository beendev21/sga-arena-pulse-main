import { useMemo } from "react";
import { TeamLogo } from "./TeamLogo";

// Interfaces locais para remover dependência de mocks/data.ts
interface Team {
  id: string;
  name: string;
  tag: string;
  logo?: string;
}

interface Match {
  id: string;
  tournamentId: string;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  bracketPosition: string;
  status: string;
}

function MatchBox({ a, b, sa, sb, winner }: { a: Team; b: Team; sa: number; sb: number; winner: 0 | 1 }) {
  return (
    <div className="border border-white/10 bg-[#0a0a0c] overflow-hidden min-w-[240px] shadow-lg group transition-all hover:border-primary/40 relative">
      <Row team={a} score={sa} win={winner === 0} />
      <div className="h-px bg-white/5 mx-2" />
      <Row team={b} score={sb} win={winner === 1} />
      {/* Accent line on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
function Row({ team, score, win }: { team: Team; score: number; win: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${win ? "bg-primary/5" : "opacity-60 grayscale group-hover:grayscale-0"}`}>
      <TeamLogo team={team} size={24} />
      <span className={`text-[13px] flex-1 truncate font-display uppercase italic font-bold tracking-wide ${win ? "text-white" : "text-muted-foreground"}`}>
        {team.name}
      </span>
      <span className={`font-display text-lg italic font-black min-w-[20px] text-center ${win ? "text-primary" : "text-muted-foreground/50"}`}>
        {score}
      </span>
    </div>
  );
}

export function Bracket({ matches = [] }: { matches?: Match[] }) {
  const bracketData = useMemo(() => {
    const findMatch = (pos: string) => matches.find(m => m.bracketPosition === pos);
    
    return {
      quarters: [findMatch("QF-1"), findMatch("QF-2"), findMatch("QF-3"), findMatch("QF-4")].filter(Boolean) as Match[],
      semis: [findMatch("SF-1"), findMatch("SF-2")].filter(Boolean) as Match[],
      final: findMatch("F-1")
    };
  }, [matches]);

  if (bracketData.quarters.length === 0 && bracketData.semis.length === 0 && !bracketData.final) {
    return (
      <div className="py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">
          Chaveamento não definido para este campeonato_
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
      <div className="flex gap-16 min-w-max p-10 bg-black/20">
        {/* Quartas */}
        <div className="flex flex-col gap-6 justify-around">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-1 bg-white/20" />
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">01. Quartas de Final</div>
          </div>
          {bracketData.quarters.map((m, i) => (
            <MatchBox key={i} a={m.teamA} b={m.teamB} sa={m.scoreA} sb={m.scoreB} winner={m.scoreA > m.scoreB ? 0 : 1} />
          ))}
        </div>

        {/* Semifinais */}
        <div className="flex flex-col gap-24 justify-around">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-1 bg-primary/40" />
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">02. Semifinais</div>
          </div>
          {bracketData.semis.map((m, i) => (
            <MatchBox key={i} a={m.teamA} b={m.teamB} sa={m.scoreA} sb={m.scoreB} winner={m.scoreA > m.scoreB ? 0 : 1} />
          ))}
        </div>

        {/* Final */}
        {bracketData.final && (
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 bg-warning" />
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-warning italic">03. Grande Final</div>
            </div>
            <MatchBox 
              a={bracketData.final.teamA} 
              b={bracketData.final.teamB} 
              sa={bracketData.final.scoreA} 
              sb={bracketData.final.scoreB} 
              winner={bracketData.final.scoreA > bracketData.final.scoreB ? 0 : 1} 
            />
          
          {/* Winner Showcase Section */}
          {bracketData.final.status === "Encerrada" && (
            <div className="mt-12 p-1 bg-gradient-to-r from-warning/50 via-warning to-warning/50">
              <div className="bg-[#0a0a0c] p-6 text-center border border-warning/20">
                <div className="text-[10px] uppercase tracking-[0.4em] text-warning font-black italic mb-4">Official Champion</div>
                <div className="relative inline-block mb-4">
                  <TeamLogo team={bracketData.final.scoreA > bracketData.final.scoreB ? bracketData.final.teamA : bracketData.final.teamB} size={80} />
                  <div className="absolute inset-0 bg-warning/20 blur-2xl -z-10 animate-pulse" />
                </div>
                <div className="font-display text-3xl italic font-black text-white uppercase tracking-tight">
                  {bracketData.final.scoreA > bracketData.final.scoreB ? bracketData.final.teamA.name : bracketData.final.teamB.name}
                </div>
                <div className="mt-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  SANTOS GAMES ARENA <span className="text-warning">/</span> SEASON 2024
                </div>
              </div>
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
