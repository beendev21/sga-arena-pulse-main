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

function CorujaoPage() {
  return (
    <div className="min-h-screen bg-[#06070a]">
      <Hero />
      <InfoBar />
    </div>
  );
}
