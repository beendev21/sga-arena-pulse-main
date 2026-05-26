import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/play/corujao")({
  head: () => ({
    meta: [
      { title: "Corujão — SGA Gaming Night" },
      { name: "description", content: "Das 21H às 8H da manhã. 11 horas de jogatina por R$120. PCs gamer, cadeiras ergonômicas, ar-condicionado e estacionamento." },
    ],
  }),
  component: CorujaoPage,
});

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1500&auto=format&fit=crop&q=80",
    alt: "Gaming Arena",
  },
  {
    src: "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg",
    alt: "Counter-Strike 2",
  },
  {
    src: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/67fbd4c273f3d5e92a18666c6379db09e74b7cda-1920x1080.jpg?auto=format&fit=fill&q=80&w=1500",
    alt: "Valorant",
  },
];

const WA_LINK = "https://wa.me/5513999999999";

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((p) => (p + 1) % SLIDES.length);

  return (
    <div className="relative w-full aspect-[16/7] overflow-hidden bg-black">
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

function InfoBar() {
  return (
    <div className="bg-[var(--surface-2)] border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-6 py-6 md:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Esquerda: título e horário */}
        <div>
          <div className="inline-block bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-3">
            🦉 Gaming Night
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
          <div className="flex items-center gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-slanted flex items-center gap-2 text-sm"
            >
              <span>▶ Garantir minha vaga</span>
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-sm font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
            >
              💬 Suporte
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
    cover: "https://images.unsplash.com/photo-1668573647936-02c97c143ba2?w=300&auto=format&fit=crop&q=80",
    isNew: true,
  },
  {
    name: "Forza Horizon 6",
    cover: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=300&auto=format&fit=crop&q=80",
    isNew: true,
  },
  {
    name: "GTA FiveM",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=80",
    isNew: false,
  },
  {
    name: "Counter-Strike 2",
    cover: "https://www.esports.net/de/wp-content/uploads/sites/7/2025/11/Valve-Counter-Strike-2.jpg",
    isNew: false,
  },
  {
    name: "Valorant",
    cover: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/67fbd4c273f3d5e92a18666c6379db09e74b7cda-1920x1080.jpg?auto=format&fit=fill&q=80&w=300",
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

const STRUCTURE = [
  { icon: "🖥️", label: "PCs Gamer Alta Performance" },
  { icon: "🪑", label: "Cadeiras Ergonômicas" },
  { icon: "❄️", label: "Ar-condicionado" },
  { icon: "🅿️", label: "Estacionamento no local" },
  { icon: "⌨️", label: "Periféricos Redragon" },
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
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-semibold text-white/80">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const THEMES = [
  {
    badge: "Temático",
    name: "🔫 Só CS2",
    desc: "Noite inteira de Faceit e matchmaking competitivo. Para quem respira Counter-Strike.",
    accent: "#e5303a",
  },
  {
    badge: "Temático",
    name: "⚡ Só Valorant",
    desc: "Ranked a noite toda. Duos, cinco fechado, como preferir.",
    accent: "#ff4655",
  },
  {
    badge: "Rodízio",
    name: "🎮 Rodízio Livre",
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
                className="inline-block text-[10px] font-black px-2.5 py-1 uppercase tracking-widest mb-4 text-white"
                style={{ background: theme.accent }}
              >
                {theme.badge}
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

function FinalCTA() {
  return (
    <section
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
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-slanted flex items-center gap-2 text-sm"
            >
              <span>▶ Garantir minha vaga</span>
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-sm font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
            >
              💬 Suporte
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CorujaoPage() {
  return (
    <div className="min-h-screen bg-[#06070a]">
      <Hero />
      <InfoBar />
      <GamesSection />
      <HowItWorksSection />
      <StructureSection />
      <ThematicSection />
      <FinalCTA />
    </div>
  );
}
