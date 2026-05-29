import { createFileRoute, Link } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Wifi, LogIn } from "lucide-react";
import { useAuth } from "@/store/auth";
import { fetchMinhasInscricoes, type MixInscricao } from "@/lib/mix-api";

const JOGO_LABEL: Record<string, string> = { cs2: "CS2", valorant: "VALORANT", lol: "LoL" };
const JOGO_COR:   Record<string, string> = { cs2: "#f59e0b", valorant: "#ff4655", lol: "#3b82f6" };

export const Route = createFileRoute("/meus-mixes")({
  head: () => ({
    meta: ogMeta({
      title: "Meus Mixes — SGA",
      description: "Seus mixes agendados na Santos Games Arena.",
      path: "/meus-mixes"
    })
  }),
  component: MeusMixesPage,
});

function MeusMixesPage() {
  const user = useAuth(s => s.user);
  const [inscricoes, setInscricoes] = useState<MixInscricao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) { setCarregando(false); return; }
    fetchMinhasInscricoes()
      .then(setInscricoes)
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#06070a] px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-black uppercase italic text-white mb-3">Acesso Restrito</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-6">Faça login para ver seus mixes</p>
          <Link to="/login">
            <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:opacity-85 transition-opacity">
              <LogIn className="h-3.5 w-3.5" /> Entrar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a]">
      <div className="bg-[#0d0e12] border-b-2 border-amber-500 px-7 py-5">
        <div className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.18em] mb-2">
          ⚡ Área do Jogador
        </div>
        <h1 className="font-display text-3xl font-black uppercase italic tracking-tighter text-white">
          Meus <span className="text-amber-500">Mixes</span>
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {carregando ? (
          <p className="text-xs text-white/30 uppercase tracking-widest text-center py-12">Carregando…</p>
        ) : inscricoes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-white/30 mb-6">Você ainda não tem mixes agendados.</p>
            <Link to="/play/mix">
              <button className="px-6 py-3 bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:opacity-85 transition-opacity">
                Ver Calendário de Mixes
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {inscricoes.map((insc, i) => {
              const s = insc.sessao;
              const cor = JOGO_COR[s.jogo] ?? "#f59e0b";
              const dataFmt = new Date(`${s.dataPrevista}T12:00:00`).toLocaleDateString("pt-BR", {
                weekday: "long", day: "2-digit", month: "long"
              });

              return (
                <motion.div
                  key={insc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0e12] border border-white/[0.06] p-5"
                  style={{ borderLeft: `3px solid ${cor}` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase italic mb-1" style={{ color: cor }}>
                        {JOGO_LABEL[s.jogo] ?? s.jogo}
                      </p>
                      <p className="text-xs text-white/50 flex items-center gap-1.5 mb-1">
                        {s.modalidade === "presencial"
                          ? <><MapPin className="h-3 w-3 flex-shrink-0" />{dataFmt} às {s.horario} · Presencial</>
                          : <><Wifi className="h-3 w-3 flex-shrink-0" />{dataFmt} às {s.horario} · Online</>
                        }
                      </p>
                      {s.statusSessao === "confirmando" && (
                        <p className="text-[10px] text-amber-400/70 italic">
                          ⚠ Data sujeita a ajuste até o grupo fechar
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-1 ${
                        insc.status === "confirmado"
                          ? "bg-green-500/10 text-green-400 border border-green-500/25"
                          : insc.status === "cancelado"
                          ? "bg-white/[0.04] text-white/25 border border-white/10"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      }`}>
                        {insc.status === "confirmado"
                          ? "✓ Confirmado"
                          : insc.status === "cancelado"
                          ? "Cancelado"
                          : "Aguardando pgto"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
