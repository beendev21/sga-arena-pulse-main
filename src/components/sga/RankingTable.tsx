import { memo, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useApiController from "../../API/controler";
import { TeamLogo } from "./TeamLogo";
import { Link } from "@tanstack/react-router";
import { normalizeGame, type GameLabel } from "@/lib/game";
import { unwrapList } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const API_BASE = ((import.meta as any).env?.VITE_API_URL).replace(/\/$/, "");

export const RankingTable = memo(function RankingTable({ game }: { game: string }) {
  const api = useApiController("Teams");
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const { data: teamsRaw, isLoading: loading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.getAll({ includeAuth: false }),
  });

  const { data: rankingRaw } = useQuery({
    queryKey: ["ranking-team-per-game"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/Games/GetRankingTeamPerGame`);
      return res.json();
    },
  });

  const teams = useMemo(() => {
    const teamsMap = new Map<number, any>();
    for (const t of unwrapList(teamsRaw)) teamsMap.set(Number(t.id), t);

    const rankingData = Array.isArray(rankingRaw?.result) ? rankingRaw.result : [];
    const gameEntry = rankingData.find((g: any) => normalizeGame(g.gameName) === (game as GameLabel));
    if (!gameEntry || !gameEntry.teamRankings?.length) return [];

    return gameEntry.teamRankings.map((r: any) => ({
      ...teamsMap.get(Number(r.teamId)),
      id: r.teamId,
      name: r.teamName,
      wins: r.wins,
      losses: r.losses,
      winRate: r.winRate,
    }));
  }, [teamsRaw, rankingRaw, game]);

  // stagger de entrada nas linhas
  useGSAP(() => {
    const rows = tbodyRef.current?.querySelectorAll("tr");
    if (!rows?.length) return;

    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: tbodyRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );

    // progress bars de winrate animadas com ScrollTrigger
    const bars = tbodyRef.current?.querySelectorAll<HTMLElement>(".wr-bar-fill");
    bars?.forEach((bar) => {
      const target = bar.dataset.wr ?? "0";
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: `${target}%`,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 90%",
            once: true,
          },
        }
      );
    });
  }, { dependencies: [teams, game], scope: tbodyRef });

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Buscando ranking...</div>;
  if (!teams.length) return <div className="p-8 text-center text-muted-foreground text-sm">Nenhum time encontrado.</div>;

  return (
    <div className="overflow-x-auto ds-card">
      <table className="w-full text-sm min-w-[360px]">
        <thead className="bg-[var(--surface-3)] text-xs uppercase tracking-wide font-bold text-muted-foreground">
          <tr>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left w-10">#</th>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left">Time</th>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">V</th>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">D</th>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-right hidden sm:table-cell">Saldo</th>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-left min-w-[100px] sm:min-w-[140px]">WR</th>
            <th className="px-3 sm:px-4 py-3 sm:py-4 text-right hidden md:table-cell">ELO</th>
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {teams.map((t, i) => {
            const wr = Math.round((t.winRate ?? 0) * 100);
            const saldo = (t.wins ?? 0) - (t.losses ?? 0);
            const wrColor = wr >= 60 ? "var(--success)" : wr >= 40 ? "var(--warning)" : "var(--destructive)";

            return (
              <tr key={t.id} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition">
                <td className="px-3 sm:px-4 py-3 sm:py-4 font-display text-base sm:text-lg font-black">
                  <span className={i < 3 ? "text-primary" : "text-muted-foreground"}>{i + 1}</span>
                </td>
                <td className="px-3 sm:px-4 py-3 sm:py-4">
                  <Link to="/teams/$teamId" params={{ teamId: String(t.id) } as any} className="flex items-center gap-2 sm:gap-3 hover:text-primary transition-colors">
                    <TeamLogo team={t} size={28} />
                    <span className="font-display text-sm sm:text-base font-bold uppercase tracking-tight truncate">{t.name}</span>
                  </Link>
                </td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-success font-bold">{t.wins ?? 0}</td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-destructive font-bold">{t.losses ?? 0}</td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-semibold hidden sm:table-cell">{saldo > 0 ? "+" : ""}{saldo}</td>
                <td className="px-3 sm:px-4 py-3 sm:py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="wr-bar-fill h-full rounded-full"
                        data-wr={wr}
                        style={{ width: "0%", background: wrColor }}
                      />
                    </div>
                    <span className="text-xs font-bold w-7 text-right tabular-nums">{wr}%</span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-display text-base sm:text-lg font-black text-primary hidden md:table-cell">{t.elo ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
