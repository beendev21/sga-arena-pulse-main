import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GalleryGrid } from "@/components/sga/GalleryGrid";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Galeria — SGA" }] }),
  component: G,
});
function G() {
  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,163,255,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Moments
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 border-l-4 border-primary pl-6 md:pl-10 relative"
        >
          <div className="absolute -left-1 top-0 h-full w-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div className="bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 italic mb-4 inline-block tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            GALLERY_VAULT_v2.0
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Galeria da <span className="text-primary">Comunidade</span>.
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl leading-relaxed font-medium">
            Registros dos esquadrões, bastidores dos eventos presenciais e os melhores momentos capturados na Santos Games Arena.
          </p>
        </motion.div>

        {/* Gallery Container with HUD Accents */}
        <div className="relative group">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-white/10 group-hover:border-primary/40 transition-colors" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-white/10 group-hover:border-primary/40 transition-colors" />
          
          <div className="absolute top-0 right-0 p-4 text-[8px] font-black text-white/5 uppercase tracking-[0.4em] pointer-events-none">
            Archive_Stream // Community Assets
          </div>

          <div className="relative z-10">
            <GalleryGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
