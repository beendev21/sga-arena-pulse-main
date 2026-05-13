import { useState } from "react";
import { Play, X } from "lucide-react";
import type { Highlight } from "@/mocks/data";

export function HighlightCard({ h }: { h: Highlight }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-xl border border-border/60 bg-card-grad text-left"
      >
        <div className="relative h-44 overflow-hidden">
          <img src={h.thumbnail} alt={h.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-14 w-14 grid place-items-center rounded-full bg-neon shadow-neon group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 text-primary-foreground translate-x-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-background/80 text-xs">{h.duration}</div>
        </div>
        <div className="p-3">
          <div className="font-display text-sm truncate">{h.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{h.player}</div>
        </div>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/90 backdrop-blur p-4" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden ring-neon" onClick={(e) => e.stopPropagation()}>
            <video src={h.videoUrl} controls autoPlay className="h-full w-full" />
            <button className="absolute top-3 right-3 p-2 rounded-full bg-background/80" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
