import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight,
  Play, MessageCircle, Users,
  Crosshair, Zap, Trophy,
  Monitor, MapPin, Wifi, Armchair,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const MIX_WA_LINK = "https://wa.me/5516991069776";
const AMBER = "#f59e0b";

const MIX_SLIDES = [
  {
    src: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/bbf32985-5791-4a3c-143b-8fed0a6a6600/public",
    alt: "Counter-Strike 2",
  },
  {
    src: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/170f43df-2960-438b-9848-16a6e028f200/public",
    alt: "Valorant",
  },
];

const LOBBIES = [
  {
    id: 1,
    game: "CS2",
    fullName: "Counter-Strike 2",
    Icon: Crosshair,
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/bbf32985-5791-4a3c-143b-8fed0a6a6600/public",
    mode: "PRESENCIAL" as const,
    location: "Santos Games Arena",
    participants: 6,
    max: 10,
    accent: AMBER,
  },
  {
    id: 2,
    game: "VALORANT",
    fullName: "Valorant",
    Icon: Zap,
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/170f43df-2960-438b-9848-16a6e028f200/public",
    mode: "PRESENCIAL" as const,
    location: "Santos Games Arena",
    participants: 3,
    max: 10,
    accent: "#ff4655",
  },
  {
    id: 3,
    game: "LOL",
    fullName: "League of Legends",
    Icon: Trophy,
    cover: null,
    mode: "ONLINE" as const,
    location: "Em casa",
    participants: 0,
    max: 10,
    accent: "#3b82f6",
  },
] as const;

type Lobby = (typeof LOBBIES)[number];

export const Route = createFileRoute("/play/mix")({
  head: () => ({ meta: ogMeta({ title: "Mix — SGA Gaming", description: "Jogue em grupo. Pague meio ingresso. Mix de CS2, Valorant e LoL na Santos Games Arena.", path: "/play/mix" }) }),
  component: MixPage,
});

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % MIX_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + MIX_SLIDES.length) % MIX_SLIDES.length);
  const next = () => setCurrent((p) => (p + 1) % MIX_SLIDES.length);

  return (
    <div className="relative w-full h-[75vh] md:h-auto md:aspect-[16/7] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={MIX_SLIDES[current].src}
          alt={MIX_SLIDES[current].alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(245,158,11,0.06) 0%, transparent 50%)" }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: AMBER }} />

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-amber-500/80 transition-colors"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-amber-500/80 transition-colors"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {MIX_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-sm h-1.5 ${i === current ? "w-6" : "w-1.5 bg-white/40"}`}
            style={i === current ? { background: AMBER } : {}}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function InfoBar({ onParticipate }: { onParticipate: () => void }) {
  const { trackWhatsAppClick } = useAnalytics();
  return (
    <div className="bg-[var(--surface-2)] border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6 py-6 md:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div
            className="inline-flex items-center gap-1.5 text-black text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-3"
            style={{ background: AMBER }}
          >
            <Crosshair className="h-3 w-3" /> Jogatina em Grupo
          </div>
          <h1 className="font-display text-4xl md:text-5xl uppercase italic font-black tracking-tighter leading-none text-white">
            MIX <span style={{ color: AMBER }}>SGA</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/60 uppercase tracking-wide">
            <span className="text-white font-bold">10 pessoas</span> por lobby · Presencial e Online · CS2, Valorant e LoL
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3">
          <div className="text-right">
            <div className="font-display text-3xl md:text-4xl font-black italic leading-none" style={{ color: AMBER }}>
              MEIO INGRESSO
            </div>
            <div className="text-[11px] text-white/50 uppercase tracking-widest mt-1">
              sinal de 50% · vaga garantida no grupo
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onParticipate} className="btn-slanted-amber flex items-center gap-2 text-sm">
              <Play className="h-3 w-3 fill-current" /> Quero Participar
            </button>
            <a
              href={MIX_WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-sm font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
              onClick={() => trackWhatsAppClick("mix")}
            >
              <MessageCircle className="h-4 w-4" /> Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: AMBER }}>//</span>
      <h2 className="text-xs font-black uppercase tracking-[0.15em] text-white/40">{children}</h2>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

function LobbyCard({ lobby, onParticipate }: { lobby: Lobby; onParticipate: (l: Lobby) => void }) {
  const pct = (lobby.participants / lobby.max) * 100;
  const { Icon } = lobby;
  const isOnline = lobby.mode === "ONLINE";

  return (
    <div
      className="relative bg-[var(--surface-2)] border border-white/[0.06] hover:border-white/20 overflow-hidden transition-colors"
      style={{ borderTop: `2px solid ${lobby.accent}` }}
    >
      {lobby.cover ? (
        <div className="relative h-36 overflow-hidden">
          <img src={lobby.cover} alt={lobby.fullName} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--surface-2)]" />
          <div className="absolute bottom-3 left-5">
            <p className="font-display text-2xl font-black uppercase italic tracking-tight text-white drop-shadow-lg">
              {lobby.game}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-36 flex flex-col items-center justify-center gap-2" style={{ background: `${lobby.accent}08` }}>
          <Icon className="h-10 w-10 opacity-15" style={{ color: lobby.accent }} />
          <p className="font-display text-2xl font-black uppercase italic tracking-tight text-white">{lobby.game}</p>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-white/40 uppercase tracking-wide">{lobby.fullName}</p>
          <span
            className="text-[9px] font-black px-2 py-1 uppercase tracking-widest"
            style={
              isOnline
                ? { background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }
                : { background: `${lobby.accent}18`, color: lobby.accent, border: `1px solid ${lobby.accent}35` }
            }
          >
            {lobby.mode}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <MapPin className="h-3 w-3 text-white/30" />
          <p className="text-xs text-white/40 uppercase tracking-wide">{lobby.location}</p>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs font-bold text-white/70">
                <span className="font-black" style={{ color: lobby.accent }}>{lobby.participants}</span>
                <span className="text-white/30">/{lobby.max}</span> participantes
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: lobby.accent }}>
              {lobby.participants === 0 ? "ABERTO" : lobby.participants >= lobby.max ? "COMPLETO" : "PREENCHENDO"}
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ background: lobby.accent }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Organizando próximo Mix</p>
          <button
            onClick={() => onParticipate(lobby)}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-80"
            style={{ background: lobby.accent }}
          >
            <Play className="h-2.5 w-2.5 fill-current" /> Quero Participar
          </button>
        </div>
      </div>
    </div>
  );
}

function LobbiesSection({ onParticipate }: { onParticipate: (l: Lobby) => void }) {
  return (
    <section className="py-12 md:py-16 border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Lobbies Ativos</SectionLabel>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOBBIES.map((lobby, i) => (
            <motion.div
              key={lobby.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <LobbyCard lobby={lobby} onParticipate={onParticipate} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MIX_STEPS = [
  {
    num: "01",
    title: "Escolha seu lobby",
    desc: "CS2, Valorant ou LoL. Presencial na SGA ou online em casa. Você decide.",
  },
  {
    num: "02",
    title: "Reserve com meio ingresso",
    desc: "Pague 50% para garantir sua vaga. Sem fila, sem perda de lugar.",
  },
  {
    num: "03",
    title: "Jogue quando fechar 10",
    desc: "Com o grupo completo, combinamos a data e hora. É só aparecer e jogar.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface-1)] border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Como funciona</SectionLabel>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {MIX_STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-[var(--surface-2)] border border-white/[0.06] p-6 overflow-hidden"
              style={{ borderTop: `2px solid ${AMBER}` }}
            >
              <span
                className="absolute top-3 right-4 font-display text-5xl font-black italic select-none leading-none"
                style={{ color: "rgba(245,158,11,0.07)" }}
              >
                {step.num}
              </span>
              <p className="font-display text-base font-black uppercase tracking-wide text-white mb-2">{step.title}</p>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MIX_STRUCTURE: { icon: LucideIcon; label: string }[] = [
  { icon: Crosshair, label: "CS2 Competitivo" },
  { icon: Zap, label: "Valorant Ranked" },
  { icon: Trophy, label: "League of Legends" },
  { icon: Monitor, label: "PCs Gamer Alta Performance" },
  { icon: Armchair, label: "Cadeiras Ergonômicas" },
  { icon: MapPin, label: "Santos Games Arena" },
  { icon: Wifi, label: "Modo Online disponível" },
];

function StructureSection() {
  return (
    <section className="py-12 md:py-16 border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Jogos e Estrutura</SectionLabel>
        <div className="mt-6 flex flex-wrap gap-3">
          {MIX_STRUCTURE.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 bg-[var(--surface-2)] border border-white/[0.06] hover:border-amber-500/30 px-5 py-3 transition-colors"
            >
              <item.icon className="h-5 w-5 opacity-70" style={{ color: AMBER }} />
              <span className="text-sm font-semibold text-white/80">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onParticipate }: { onParticipate: () => void }) {
  const { trackWhatsAppClick, trackCTAVisible } = useAnalytics();
  const sectionRef = useRef<HTMLElement>(null);
  const firedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackCTAVisible("mix");
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trackCTAVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20"
      style={{
        background: "linear-gradient(135deg, #0f0b00 0%, #06070a 60%)",
        borderTop: "1px solid rgba(245,158,11,0.15)",
      }}
    >
      <div className="mx-auto max-w-[1500px] px-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
            Pronto pra jogar{" "}
            <span style={{ color: AMBER }}>em grupo?</span>
          </h2>
          <p className="mt-3 text-sm text-white/40 uppercase tracking-wide">
            CS2 · Valorant · LoL · Santos Games Arena
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="font-display text-3xl font-black italic leading-none" style={{ color: AMBER }}>
              MEIO INGRESSO
            </div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest mt-1">
              sinal de 50% · vaga garantida
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onParticipate} className="btn-slanted-amber flex items-center gap-2 text-sm">
              <Play className="h-3 w-3 fill-current" /> Quero Participar
            </button>
            <a
              href={MIX_WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-sm font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
              onClick={() => trackWhatsAppClick("mix")}
            >
              <MessageCircle className="h-4 w-4" /> Suporte
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ParticipateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trackWhatsAppClick } = useAnalytics();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md border"
        style={{ background: "#0f0b00", borderColor: "rgba(245,158,11,0.25)" }}
      >
        <DialogTitle className="font-display text-xl font-black uppercase italic tracking-tight text-white">
          Meio ingresso necessário
        </DialogTitle>
        <div className="mt-2 space-y-2">
          <p className="text-sm text-white/70 leading-relaxed">
            Para participar de um grupo de Mix você precisa de meio ingresso.
          </p>
          <p className="text-xs text-white/40 leading-relaxed">Necessário realizar um sinal de 50%.</p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={MIX_WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-widest text-black text-center transition-opacity hover:opacity-80"
            style={{ background: AMBER }}
            onClick={() => trackWhatsAppClick("mix")}
          >
            QUERO MEU INGRESSO DO MIX
          </a>
          <a
            href={MIX_WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest text-center transition-colors hover:bg-[#25d366]/10 border"
            style={{ borderColor: "#25d366", color: "#25d366" }}
            onClick={() => trackWhatsAppClick("mix")}
          >
            <MessageCircle className="h-4 w-4" /> Suporte no WhatsApp
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MixPage() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  function handleParticipate(_lobby?: Lobby) {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#06070a]">
      <Hero />
      <InfoBar onParticipate={handleParticipate} />
      <LobbiesSection onParticipate={handleParticipate} />
      <HowItWorksSection />
      <StructureSection />
      <FinalCTA onParticipate={handleParticipate} />
      <ParticipateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
