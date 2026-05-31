import type { LucideIcon } from 'lucide-react'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'

export function AnimatedStatsCard({
  label, value, icon: Icon, accent,
}: { label: string; value: string | number; icon: LucideIcon; accent?: boolean }) {
  const num = typeof value === 'number' ? value : parseInt(String(value)) || 0
  const ref = useAnimatedCounter(num)

  return (
    <div className={`relative overflow-hidden ds-card p-5 ${accent ? 'border-primary/40' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="font-display text-3xl sm:text-4xl font-black mt-1 leading-none"
          >
            0
          </div>
        </div>
        <Icon className={`h-8 w-8 shrink-0 ${accent ? 'text-primary' : 'text-muted-foreground/70'}`} />
      </div>
      {accent && (
        <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-primary opacity-10 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  )
}
