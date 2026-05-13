import { createFileRoute } from "@tanstack/react-router";
import { getMatch, getPlayer, getTeamPlayers } from "@/mocks/data";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { Crown, Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/matches/$id")({ component: MatchPage });

function MatchPage() {
  // Extração de parâmetros da URL para busca de dados específicos.
  const { id } = Route.useParams();

  /**
   * Ponto de Integração com API:
   * Atualmente os dados são buscados de mocks de forma síncrona.
   * Em produção, utilize 'loaders' do TanStack Router ou 'useQuery'
   * para buscar dados de: GET /api/matches/:id
   */
  const m = getMatch(id);
  if (!m) return <div className="p-10 text-center">Partida não encontrada.</div>;
  const mvp = m.mvpId ? getPlayer(m.mvpId) : undefined;
  const winA = m.scoreA > m.scoreB;
  const lineupA = getTeamPlayers(m.teamA.id).slice(0, 5);
  const lineupB = getTeamPlayers(m.teamB.id).slice(0, 5);

  // Timeline: Lógica de negócio que deve vir do backend para garantir fidedignidade.
  const timeline = [
    { t: "00:12", text: `${lineupA[0]?.nick} abre o round com headshot` },
    { t: "00:38", text: `Spike plantado em A por ${lineupB[1]?.nick}` },
    { t: "01:05", text: `Defuse clutch por ${lineupA[2]?.nick}` },
    { t: "01:42", text: `Triple kill de ${lineupB[0]?.nick}` },
    { t: "02:11", text: `Ace fechando o round!` },
  ];

  return (
    <div>
      <div className="bg-hero">
        <div className="mx-auto max-w-[1500px] px-4 py-10">
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={m.status} />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{m.tournamentName}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1"><MapIcon className="h-3.5 w-3.5" /> {m.map}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 md:gap-6 rounded-2xl border border-border/60 bg-card-grad p-6 md:p-10">
            <div className={`flex flex-col items-center text-center gap-3 ${winA ? "" : "opacity-70"}`}>
              <TeamLogo team={m.teamA} size={88} />
              <div className="font-display text-xl">{m.teamA.name}</div>
              {winA && <div className="text-xs text-primary uppercase tracking-widest">Vencedor</div>}
            </div>
            <div className="text-center order-first md:order-none">
              <div className="font-display text-6xl md:text-7xl">
                <span className={winA ? "text-primary" : ""}>{m.scoreA}</span>
                <span className="text-muted-foreground mx-2 md:mx-3">:</span>
                <span className={!winA && m.status === "Encerrada" ? "text-primary" : ""}>{m.scoreB}</span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-2">{m.map}</div>
            </div>
            <div className={`flex flex-col items-center text-center gap-3 ${!winA && m.status === "Encerrada" ? "" : "opacity-70"}`}>
              <TeamLogo team={m.teamB} size={88} />
              <div className="font-display text-xl">{m.teamB.name}</div>
              {!winA && m.status === "Encerrada" && <div className="text-xs text-primary uppercase tracking-widest">Vencedor</div>}
            </div>
          </div>

          {mvp && (
            <div className="mt-6 inline-flex items-center gap-3 p-4 rounded-xl bg-card border border-primary/40 shadow-neon">
              <Crown className="h-6 w-6 text-primary" />
              <img src={mvp.avatar} alt={mvp.nick} className="h-12 w-12 rounded-full ring-2 ring-primary" />
              <div><div className="text-xs uppercase tracking-widest text-muted-foreground">MVP</div><div className="font-display">{mvp.nick}</div></div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl uppercase mb-4"><span className="text-primary">/</span> Estatísticas</h2>
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 text-left">Jogador</th>
                    <th className="px-3 py-3 text-right">K</th>
                    <th className="px-3 py-3 text-right">D</th>
                    <th className="px-3 py-3 text-right">A</th>
                    <th className="px-3 py-3 text-right">HS%</th>
                    <th className="px-3 py-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[...lineupA, ...lineupB].map((p, i) => (
                    <tr key={p.id} className={`border-t border-border/40 ${i === 5 ? "bg-muted/20" : ""}`}>
                      <td className="px-3 py-2"><div className="flex items-center gap-2">
                        <img src={p.avatar} className="h-7 w-7 rounded-full" alt="" />
                        <span className="font-display">{p.nick}</span>
                      </div></td>
                      <td className="px-3 py-2 text-right">{p.kills}</td>
                      <td className="px-3 py-2 text-right">{p.deaths}</td>
                      <td className="px-3 py-2 text-right">{p.assists}</td>
                      <td className="px-3 py-2 text-right">{p.hs}%</td>
                      <td className="px-3 py-2 text-right text-primary font-display">{p.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl uppercase mb-4"><span className="text-primary">/</span> Timeline</h2>
            <ol className="relative border-l border-border/60 ml-3 space-y-4">
              {timeline.map((e, i) => (
                <li key={i} className="ml-4">
                  <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary shadow-neon" />
                  <div className="text-xs uppercase tracking-widest text-primary">{e.t}</div>
                  <div className="text-sm text-muted-foreground">{e.text}</div>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-display text-xl uppercase mb-4"><span className="text-primary">/</span> Highlights</h2>
            <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-primary/40">
              <video src="https://www.w3.org/2010/05/sintel/trailer.mp4" controls className="h-full w-full" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
