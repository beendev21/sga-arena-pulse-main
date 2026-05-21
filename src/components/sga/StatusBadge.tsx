import { cn } from "@/lib/utils";

const map = {
  "Ao vivo": "bg-primary/20 text-primary ring-1 ring-primary/50 animate-pulse-neon",
  "Inscrições": "bg-accent/20 text-accent-foreground ring-1 ring-accent/50",
  "Inscrições abertas": "bg-primary/20 text-primary ring-1 ring-primary/50 shadow-neon",
  "Em breve": "bg-muted text-muted-foreground ring-1 ring-border",
  "Encerrado": "bg-muted text-muted-foreground ring-1 ring-border",
  "Encerrada": "bg-muted text-muted-foreground ring-1 ring-border",
  "Agendada": "bg-secondary text-secondary-foreground ring-1 ring-border",
} as const;

export function StatusBadge({ status }: { status: string }) {
  const resolved = map[status as keyof typeof map] || map.Agendada;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wide font-bold rounded-sm",
      resolved,
    )}>
      {status === "Ao vivo" && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
      {status}
    </span>
  );
}
