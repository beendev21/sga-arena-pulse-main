import { players, getTeam } from "@/mocks/data";
import { TeamLogo } from "./TeamLogo";

export function PlayerStatsTable({ limit = 40 }: { limit?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
      <table className="w-full text-sm min-w-[820px]">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-3 py-3 text-left">#</th>
            <th className="px-3 py-3 text-left">Jogador</th>
            <th className="px-3 py-3 text-left">Time</th>
            <th className="px-3 py-3 text-right">K</th>
            <th className="px-3 py-3 text-right">D</th>
            <th className="px-3 py-3 text-right">A</th>
            <th className="px-3 py-3 text-right">KDA</th>
            <th className="px-3 py-3 text-right">Defuse</th>
            <th className="px-3 py-3 text-right">Plant</th>
            <th className="px-3 py-3 text-right">HS%</th>
            <th className="px-3 py-3 text-right">Rating</th>
          </tr>
        </thead>
        <tbody>
          {players.slice(0, limit).map((p, i) => {
            const team = getTeam(p.teamId)!;
            const kda = ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2);
            return (
              <tr key={p.id} className="border-t border-border/40 hover:bg-muted/30 transition">
                <td className="px-3 py-2 font-display text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img src={p.avatar} alt={p.nick} className="h-8 w-8 rounded-full ring-1 ring-primary/40" />
                    <div>
                      <div className="font-display">{p.nick}</div>
                      <div className="text-[10px] text-muted-foreground">{p.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TeamLogo team={team} size={24} />
                    <span className="text-xs">{team.tag}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">{p.kills}</td>
                <td className="px-3 py-2 text-right">{p.deaths}</td>
                <td className="px-3 py-2 text-right">{p.assists}</td>
                <td className="px-3 py-2 text-right">{kda}</td>
                <td className="px-3 py-2 text-right">{p.defuses}</td>
                <td className="px-3 py-2 text-right">{p.plants}</td>
                <td className="px-3 py-2 text-right">{p.hs}%</td>
                <td className="px-3 py-2 text-right font-display text-primary">{p.rating}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
