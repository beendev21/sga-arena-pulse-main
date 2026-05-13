import type { LucideIcon } from "lucide-react";

export function StatsCard({
  label, value, icon: Icon, accent,
}: { label: string; value: string | number; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-card-grad border border-border/60 rounded-lg p-4 ${accent ? "ring-neon" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="font-display text-xl sm:text-2xl mt-1">{value}</div>
        </div>
        <Icon className={`h-8 w-8 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-neon opacity-20 rounded-full blur-2xl" />
    </div>
  );
}
