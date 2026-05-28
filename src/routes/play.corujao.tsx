import { createFileRoute } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight,
  Moon, Play, MessageCircle,
  Monitor, Armchair, Wind, Car, Keyboard,
  Crosshair, Zap, Gamepad2, Users,
  type LucideIcon,
} from "lucide-react";

const CORUJAO_API_URL = import.meta.env.VITE_CORUJAO_API_URL || "https://painel-adm.santos-tech.com";

type VagasData = {
  sessaoId: number;
  data: string;
  totalVagas: number;
  vagasVendidas: number;
  vagasRestantes: number;
} | null;

function useVagasStream() {
  const [vagas, setVagas] = useState<VagasData>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource(`${CORUJAO_API_URL}/api/corujao/public/vagas/stream`);
    esRef.current = es;

    es.addEventListener("vagas-update", (e) => {
      try {
        setVagas(JSON.parse(e.data));
        setConnected(true);
      } catch {}
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => esRef.current?.close();
  }, [connect]);

  return { vagas, connected };
}

export const Route = createFileRoute("/play/corujao")({
  head: () => ({ meta: ogMeta({ title: "Corujão — Santos Games Arena", description: "Das 21H às 8H da manhã. 11 horas de jogatina por R$120. PCs gamer, cadeiras ergonômicas, ar-condicionado e estacionamento.", path: "/play/corujao" }) }),
  component: CorujaoPage,
});

const SLIDES = [
  {
    src: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/78b155fc-59e7-4327-a717-3276b7397600/public",
    alt: "Resident Evil Requiem",
  },
  {
    src: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/10d7d19f-a574-4e85-d8dd-c546a1e89d00/public",
    alt: "Forza Horizon 6",
  },
];

const WA_LINK = "https://wa.me/5516991069776";
const CHECKOUT_LINK = "https://checkout.santos-games.com/produto/20";

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((p) => (p + 1) % SLIDES.length);

  return (
    <div className="relative w-full h-[75vh] md:h-auto md:aspect-[16/7] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={SLIDES[current].src}
          alt={SLIDES[current].alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Setas */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-primary/80 transition-colors"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-primary/80 transition-colors"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-sm h-1.5 ${
              i === current ? "w-6 bg-primary" : "w-1.5 bg-white/40"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function formatDataCorujao(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(".", "");
}

function VagasCounter({ vagas }: { vagas: VagasData }) {
  if (!vagas) return null;
  const percent = vagas.totalVagas > 0 ? (vagas.vagasVendidas / vagas.totalVagas) * 100 : 0;
  const urgente = vagas.vagasRestantes <= 3;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Moon className="h-3 w-3 text-primary/60" />
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
          {formatDataCorujao(vagas.data)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${urgente ? "text-red-400" : "text-primary"}`} />
          <motion.span
            key={vagas.vagasRestantes}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-display text-2xl font-black italic ${urgente ? "text-red-400" : "text-primary"}`}
          >
            {vagas.vagasRestantes}
          </motion.span>
          <span className="text-xs text-white/50 uppercase tracking-wide">
            {vagas.vagasRestantes === 1 ? "vaga restante" : "vagas restantes"}
          </span>
        </div>
        <div className="w-24 h-2 bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full ${urgente ? "bg-red-400" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

function InfoBar({ vagas }: { vagas: VagasData }) {
  const { trackWhatsAppClick, trackCheckoutClick } = useAnalytics();
  return (
    <div className="bg-[var(--surface-2)] border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6 py-6 md:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Esquerda: título e horário */}
        <div>
          <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-3">
            <Moon className="h-3 w-3" /> Gaming Night
          </div>
          <h1 className="font-display text-4xl md:text-5xl uppercase italic font-black tracking-tighter leading-none text-white">
            CORUJÃO <span className="text-primary">SGA</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/60 uppercase tracking-wide">
            <span className="text-white font-bold">21H</span> até{" "}
            <span className="text-white font-bold">8H da manhã</span> · 11 horas sem parar
          </p>
        </div>

        {/* Direita: preço e CTAs */}
        <div className="flex flex-col items-start sm:items-end gap-3">
          <div className="text-right">
            <div className="font-display text-5xl font-black text-primary italic leading-none">
              R$120
            </div>
            <div className="text-[11px] text-white/50 uppercase tracking-widest mt-1">
              por pessoa · noite inteira
            </div>
          </div>
          <VagasCounter vagas={vagas} />
          <div className="flex items-center gap-3">
            <a
              href={CHECKOUT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-slanted flex items-center gap-2 text-sm"
              onClick={() => trackCheckoutClick('corujao')}
            >
              <Play className="h-3 w-3 fill-current" /> Garantir minha vaga
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-sm font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
              onClick={() => trackWhatsAppClick('corujao')}
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
      <span className="text-primary text-xs font-black uppercase tracking-[0.2em]">//</span>
      <h2 className="text-xs font-black uppercase tracking-[0.15em] text-white/40">{children}</h2>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

const GAMES = [
  {
    name: "Resident Evil Requiem",
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/6c16bb8d-b2bb-47a2-4f37-d1b699fc7d00/public",
    isNew: true,
  },
  {
    name: "Forza Horizon 6",
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/5e8c6494-2e7c-4a53-6e3b-d75f1bc71400/public",
    isNew: true,
  },
  {
    name: "GTA FiveM",
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/8503bb8b-81f2-4d03-e883-0b682a552100/public",
    isNew: false,
  },
  {
    name: "Counter-Strike 2",
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/bbf32985-5791-4a3c-143b-8fed0a6a6600/public",
    isNew: false,
  },
  {
    name: "Valorant",
    cover: "https://imagedelivery.net/M0gutnZx9zz7jFEoo6zT_g/170f43df-2960-438b-9848-16a6e028f200/public",
    isNew: false,
  },
];

function GamesSection() {
  return (
    <section className="py-12 md:py-16 border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Jogos disponíveis</SectionLabel>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {GAMES.map((game) => (
            <motion.div
              key={game.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="relative group overflow-hidden border border-white/[0.06] hover:border-primary/50 transition-colors"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={game.cover}
                alt={game.name}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {game.isNew && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                  Novo
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-display text-xs font-black uppercase tracking-wide text-white leading-tight">
                  {game.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Chegue às 21H",
    desc: "Apresente seu ingresso na recepção e escolha seu PC gamer.",
  },
  {
    num: "02",
    title: "Escolha o tema",
    desc: "Rodízio livre, só CS2 ou só Valorant — você decide a vibe da noite.",
  },
  {
    num: "03",
    title: "Jogue até 8H",
    desc: "Sem limite de horas. Estrutura completa disponível a noite toda.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface-1)] border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Como funciona</SectionLabel>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-[var(--surface-2)] border border-white/[0.06] p-6 border-t-2 border-t-primary overflow-hidden"
            >
              <span className="absolute top-3 right-4 font-display text-5xl font-black italic text-primary/[0.07] select-none leading-none">
                {step.num}
              </span>
              <p className="font-display text-base font-black uppercase tracking-wide text-white mb-2">
                {step.title}
              </p>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STRUCTURE: { icon: LucideIcon; label: string }[] = [
  { icon: Monitor, label: "PCs Gamer Alta Performance" },
  { icon: Armchair, label: "Cadeiras Ergonômicas" },
  { icon: Wind, label: "Ar-condicionado" },
  { icon: Car, label: "Estacionamento no local" },
  { icon: Keyboard, label: "Periféricos Redragon" },
];

function StructureSection() {
  return (
    <section className="py-12 md:py-16 border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Estrutura</SectionLabel>
        <div className="mt-6 flex flex-wrap gap-3">
          {STRUCTURE.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 bg-[var(--surface-2)] border border-white/[0.06] hover:border-primary/30 px-5 py-3 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary/70" />
              <span className="text-sm font-semibold text-white/80">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const THEMES: { badge: string; icon: LucideIcon; name: string; desc: string; accent: string }[] = [
  {
    badge: "Temático",
    icon: Crosshair,
    name: "Só CS2",
    desc: "Noite inteira de Faceit e matchmaking competitivo. Para quem respira Counter-Strike.",
    accent: "#e5303a",
  },
  {
    badge: "Temático",
    icon: Zap,
    name: "Só Valorant",
    desc: "Ranked a noite toda. Duos, cinco fechado, como preferir.",
    accent: "#ff4655",
  },
  {
    badge: "Rodízio",
    icon: Gamepad2,
    name: "Rodízio Livre",
    desc: "Todos os títulos liberados. RE Requiem, Forza, GTA FiveM, CS2, Valorant e mais.",
    accent: "#7c3aed",
  },
];

function ThematicSection() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface-1)] border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6">
        <SectionLabel>Corujão Temático</SectionLabel>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {THEMES.map((theme, i) => (
            <motion.div
              key={theme.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-[var(--surface-2)] border border-white/[0.06] hover:border-white/20 p-6 overflow-hidden transition-colors"
              style={{ borderTop: `2px solid ${theme.accent}` }}
            >
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-4 text-white"
                style={{ background: theme.accent }}
              >
                <theme.icon className="h-3 w-3" /> {theme.badge}
              </span>
              <p className="font-display text-xl font-black uppercase italic tracking-tight text-white mb-3">
                {theme.name}
              </p>
              <p className="text-sm text-white/50 leading-relaxed">{theme.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ vagas }: { vagas: VagasData }) {
  const { trackWhatsAppClick, trackCheckoutClick, trackCTAVisible } = useAnalytics();
  const sectionRef = useRef<HTMLElement>(null);
  const firedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackCTAVisible('corujao');
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trackCTAVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20"
      style={{
        background: "linear-gradient(135deg, #1a0008 0%, #06070a 60%)",
        borderTop: "1px solid rgba(229,48,58,0.15)",
      }}
    >
      <div className="mx-auto max-w-[1500px] px-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
            Pronto pra{" "}
            <span className="text-primary">encarar</span> a noite?
          </h2>
          <p className="mt-3 text-sm text-white/40 uppercase tracking-wide">
            Das 21H às 8H · Santos Games Arena
          </p>
          <VagasCounter vagas={vagas} />
        </div>
        <div className="flex flex-col items-start sm:items-end gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="font-display text-5xl font-black text-primary italic leading-none">
              R$120
            </div>
            <div className="text-[11px] text-white/40 uppercase tracking-widest mt-1">
              por pessoa · noite inteira
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={CHECKOUT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-slanted flex items-center gap-2 text-sm"
              onClick={() => trackCheckoutClick('corujao')}
            >
              <Play className="h-3 w-3 fill-current" /> Garantir minha vaga
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-sm font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
              onClick={() => trackWhatsAppClick('corujao')}
            >
              <MessageCircle className="h-4 w-4" /> Suporte
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CorujaoPage() {
  const { vagas } = useVagasStream();

  return (
    <div className="min-h-screen bg-[#06070a]">
      <Hero />
      <InfoBar vagas={vagas} />
      <GamesSection />
      <HowItWorksSection />
      <StructureSection />
      <ThematicSection />
      <FinalCTA vagas={vagas} />
    </div>
  );
}
