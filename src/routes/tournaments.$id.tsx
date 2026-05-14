import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getTournament, matches, teams, lastTournament } from "@/mocks/data";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { MatchCard } from "@/components/sga/MatchCard";
import { Bracket } from "@/components/sga/Bracket";
import { Trophy, Calendar, Users, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { formatDateBR } from "@/lib/dateUtils";

export const Route = createFileRoute("/tournaments/$id")({ component: TPage });

function TPage() {
  // O ID do torneio dita todo o conteúdo da página.
  const { id } = Route.useParams();

  /**
   * Integração com API:
   * Requisitar dados completos do torneio: GET /api/tournaments/:id
   * As partidas (tMatches) devem ser filtradas no backend por performance: GET /api/matches?tournamentId=:id
   */
  const t = getTournament(id);
  const [activeTab, setActiveTab] = useState("geral");

  if (!t) return <div className="p-10 text-center">Campeonato não encontrado.</div>;
  const tMatches = matches.filter((m) => m.tournamentId === id);

  return (
    <div>
      <div className="relative h-72 overflow-hidden">
        <img src={t.banner} alt={t.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative mx-auto max-w-[1500px] px-4 h-full flex flex-col justify-end pb-6">
          <StatusBadge status={t.status} />
          <h1 className="font-display text-4xl md:text-5xl uppercase mt-2">{t.name}</h1>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-primary" /> {t.prize}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {t.teamsCount} times</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDateBR(t.startDate)} → {formatDateBR(t.endDate)}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-8">
        {/* Navegação por Abas */}
        <div className="flex border-b border-border/60 gap-8 mb-8 overflow-x-auto scrollbar-none">
          {["geral", "chaveamento", "partidas", "regulamento"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs uppercase tracking-[0.2em] font-display transition relative whitespace-nowrap ${
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-neon" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {activeTab === "geral" && (
            <>
              <section>
                <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Times inscritos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {teams.map((tm) => (
                    <div key={tm.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card-grad border border-border/60">
                      <TeamLogo team={tm} size={48} />
                      <div className="text-xs text-center font-display truncate w-full">{tm.tag}</div>
                    </div>
                  ))}
                </div>
              </section>

              {t.status === "Encerrado" && (
                <section>
                  <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Campeão</h2>
                  <div className="inline-flex items-center gap-3 p-4 rounded-xl bg-neon shadow-neon">
                    <TeamLogo team={lastTournament.podium[0].team} size={56} />
                    <div>
                      <div className="font-display text-xl text-primary-foreground">{lastTournament.podium[0].team.name}</div>
                      <div className="text-xs text-primary-foreground/80 uppercase tracking-widest">Campeão · MVP {lastTournament.podium[0].mvp?.nick}</div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === "chaveamento" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Chaveamento</h2>
              <Bracket />
            </section>
          )}

          {activeTab === "partidas" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Partidas</h2>
              {tMatches.length === 0 ? (
                <div className="text-muted-foreground">Sem partidas registradas ainda.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tMatches.map((m) => <MatchCard key={m.id} m={m} />)}
                </div>
              )}
            </section>
          )}

          {activeTab === "regulamento" && (
            <section className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-display uppercase tracking-widest">
                    <CheckCircle2 className="h-5 w-5" /> Quem pode jogar
                  </div>
                  <p className="text-sm text-muted-foreground">Diamante 3, Ascendente 1-3, Imortal 1-3 e Radiante.</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-destructive/20 space-y-4">
                  <div className="flex items-center gap-2 text-destructive font-display uppercase tracking-widest">
                    <XCircle className="h-5 w-5" /> Quem não pode
                  </div>
                  <p className="text-sm text-muted-foreground">Diamante 1, Diamante 2 ou qualquer elo abaixo.</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-display text-xl uppercase tracking-widest">Divisão de Tiers</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { t: "Tier 01", n: "Diamond", d: "Apenas Diamante 3.", c: "border-cs2/30" },
                    { t: "Tier 02", n: "Ascendant", d: "Ascendente 1, 2 e 3.", c: "border-valorant/30" },
                    { t: "Tier 03", n: "Immortal", d: "Imortal 1, 2 e 3.", c: "border-lol/30" },
                    { t: "Tier 04", n: "Radiant", d: "Nível Radiante permitido.", c: "border-primary/30 shadow-neon" },
                  ].map((item) => (
                    <div key={item.t} className={`p-4 rounded-xl border bg-card-grad ${item.c}`}>
                      <div className="text-[10px] text-muted-foreground uppercase mb-1">{item.t}</div>
                      <div className="font-display text-lg mb-2">{item.n}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-primary uppercase block mb-1">Aviso Importante</span>
                  A Série A é exclusiva para jogadores de nível avançado. O descumprimento dos requisitos de elo resultará em desclassificação imediata do time, sem direito a reembolso.
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
