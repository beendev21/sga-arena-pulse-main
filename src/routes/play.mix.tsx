import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Wifi, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/store/auth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { fetchSessoes, inscreverSessao, type MixSessao } from "@/lib/mix-api";

const AMBER = "#f59e0b";
const MIX_WA_LINK = "https://wa.me/5516991069776";
const INTENT_KEY = "mix_intent_sessao_id";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const JOGO_CONFIG = {
  cs2:     { label: "CS2",      cor: AMBER,     chipCls: "border-l-amber-500 bg-amber-500/10 text-amber-400" },
  valorant:{ label: "VALORANT", cor: "#ff4655",  chipCls: "border-l-red-500 bg-red-500/10 text-red-400" },
  lol:     { label: "LoL",      cor: "#3b82f6",  chipCls: "border-l-blue-500 bg-blue-500/10 text-blue-400" },
} as const;

export const Route = createFileRoute("/play/mix")({
  head: () => ({
    meta: ogMeta({
      title: "Mix — SGA Gaming",
      description: "Jogue em grupo. Calendário de mixes em aberto. CS2, Valorant e LoL na Santos Games Arena.",
      path: "/play/mix"
    })
  }),
  component: MixPage,
});

// ── helpers ───────────────────────────────────────────────────────────────────

function buildDias(ano: number, mes: number) {
  const primeiro = new Date(ano, mes, 1).getDay();
  const totalMes = new Date(ano, mes + 1, 0).getDate();
  const totalPrev = new Date(ano, mes, 0).getDate();
  const dias: { dia: number; mesAtual: boolean }[] = [];
  for (let i = primeiro - 1; i >= 0; i--) dias.push({ dia: totalPrev - i, mesAtual: false });
  for (let d = 1; d <= totalMes; d++) dias.push({ dia: d, mesAtual: true });
  const restante = dias.length % 7 === 0 ? 0 : 7 - (dias.length % 7);
  for (let i = 1; i <= restante; i++) dias.push({ dia: i, mesAtual: false });
  return dias;
}

// ── Calendário ────────────────────────────────────────────────────────────────

function Calendario({
  sessoes,
  sessaoSelecionada,
  onSelecionarSessao,
}: {
  sessoes: MixSessao[];
  sessaoSelecionada: MixSessao | null;
  onSelecionarSessao: (s: MixSessao) => void;
}) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());

  function prevMes() {
    if (mes === 0) { setAno(a => a - 1); setMes(11); } else setMes(m => m - 1);
  }
  function nextMes() {
    if (mes === 11) { setAno(a => a + 1); setMes(0); } else setMes(m => m + 1);
  }

  const dias = buildDias(ano, mes);

  return (
    <div className="flex-1 p-6 border-r border-white/[0.05] min-w-0">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMes}
          className="h-8 w-8 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/50 hover:border-amber-500/50 hover:text-amber-500 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-black uppercase tracking-[0.12em]">
          {MESES[mes]} <span style={{ color: AMBER }}>{ano}</span>
        </span>
        <button
          onClick={nextMes}
          className="h-8 w-8 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/50 hover:border-amber-500/50 hover:text-amber-500 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center text-[9px] font-bold text-white/25 uppercase tracking-[0.1em] py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {dias.map(({ dia, mesAtual }, idx) => {
          const dataStr = mesAtual
            ? `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
            : null;
          const sessoesNoDia = dataStr
            ? sessoes.filter(s => s.dataPrevista === dataStr)
            : [];
          const isHoje =
            mesAtual &&
            hoje.getFullYear() === ano &&
            hoje.getMonth() === mes &&
            hoje.getDate() === dia;

          return (
            <div
              key={idx}
              className={`min-h-[68px] p-1 border transition-colors ${
                mesAtual ? "bg-white/[0.02] border-white/[0.04]" : "bg-transparent border-transparent"
              } ${sessoesNoDia.length ? "cursor-pointer hover:border-white/15 hover:bg-white/[0.04]" : ""} ${
                isHoje ? "border-amber-500/30 bg-amber-500/[0.04]" : ""
              }`}
              onClick={() => sessoesNoDia.length === 1 && onSelecionarSessao(sessoesNoDia[0])}
            >
              <span className={`text-[10px] block mb-[3px] ${
                mesAtual
                  ? isHoje ? "text-amber-400 font-black" : "text-white/40 font-semibold"
                  : "text-white/12"
              }`}>
                {dia}
              </span>
              {sessoesNoDia.map(s => (
                <button
                  key={s.id}
                  onClick={e => { e.stopPropagation(); onSelecionarSessao(s); }}
                  className={`w-full text-left text-[8px] font-black uppercase tracking-[0.06em] px-1 py-[2px] mb-[2px] border-l-2 truncate transition-opacity hover:opacity-80 ${
                    JOGO_CONFIG[s.jogo].chipCls
                  } ${sessaoSelecionada?.id === s.id ? "ring-1 ring-amber-500/40" : ""}`}
                >
                  {JOGO_CONFIG[s.jogo].label}{s.status === "confirmado" ? " ✓" : ""}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarMixes({
  sessoes,
  sessaoSelecionada,
  onSelecionarSessao,
  onParticipar,
}: {
  sessoes: MixSessao[];
  sessaoSelecionada: MixSessao | null;
  onSelecionarSessao: (s: MixSessao) => void;
  onParticipar: (s: MixSessao) => void;
}) {
  const emAberto = sessoes.filter(s => s.status !== "realizado" && s.status !== "cancelado");

  return (
    <div className="w-72 flex-shrink-0 p-5 bg-[#0a0b0e] flex flex-col">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-4 flex items-center gap-2">
        Mixes em Aberto
        <span className="flex-1 h-px bg-white/[0.05]" />
      </p>

      <div className="flex-1 overflow-y-auto space-y-2">
        {emAberto.length === 0 && (
          <p className="text-xs text-white/25 text-center py-8">Nenhum mix em aberto</p>
        )}
        {emAberto.map(s => {
          const pct = Math.round((s.vagasPreenchidas / s.totalVagas) * 100);
          const cor = JOGO_CONFIG[s.jogo].cor;
          const selecionado = sessaoSelecionada?.id === s.id;
          const dataFmt = new Date(`${s.dataPrevista}T12:00:00`).toLocaleDateString("pt-BR", {
            weekday: "short", day: "2-digit", month: "short"
          });

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#0d0e12] border border-white/[0.06] p-3 cursor-pointer transition-colors ${
                selecionado ? "border-amber-500/30 bg-amber-500/[0.03]" : "hover:border-white/15"
              }`}
              style={{ borderLeftWidth: 3, borderLeftColor: cor }}
              onClick={() => onSelecionarSessao(s)}
            >
              <p className="text-xs font-black uppercase italic mb-1" style={{ color: cor }}>
                {JOGO_CONFIG[s.jogo].label}
              </p>
              <p className="text-[10px] text-white/35 mb-2 flex items-center gap-1">
                {s.modalidade === "presencial"
                  ? <><MapPin className="h-2.5 w-2.5 flex-shrink-0" />{dataFmt} · {s.horario}</>
                  : <><Wifi className="h-2.5 w-2.5 flex-shrink-0" />{dataFmt} · {s.horario}</>
                }
              </p>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-[3px] bg-white/[0.06]">
                  <div className="h-full transition-all" style={{ width: `${pct}%`, background: cor }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: cor }}>
                  {s.vagasPreenchidas}/{s.totalVagas}
                </span>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.12em] ${
                s.status === "confirmado" ? "text-green-400" : "text-amber-400"
              }`}>
                {s.status === "confirmado" ? "✓ Confirmado" : "Confirmando…"}
              </span>
            </motion.div>
          );
        })}
      </div>

      {sessaoSelecionada && (
        <button
          onClick={() => onParticipar(sessaoSelecionada)}
          className="mt-4 w-full py-3 text-[11px] font-black uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-85"
          style={{ background: JOGO_CONFIG[sessaoSelecionada.jogo].cor }}
        >
          ▶ Quero Participar
        </button>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function ModalCheckout({
  sessao,
  onClose,
}: {
  sessao: MixSessao | null;
  onClose: () => void;
}) {
  const user = useAuth(s => s.user);
  const navigate = useNavigate();
  const [aceite, setAceite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setAceite(false);
    setErro(null);
  }, [sessao?.id]);

  if (!sessao) return null;

  const cor = JOGO_CONFIG[sessao.jogo].cor;
  const vagasRestantes = sessao.totalVagas - sessao.vagasPreenchidas;
  const dataFmt = new Date(`${sessao.dataPrevista}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long"
  });

  async function handleParticipar() {
    if (!user) {
      sessionStorage.setItem(INTENT_KEY, String(sessao!.id));
      navigate({ to: "/login" });
      return;
    }
    if (sessao!.status === "confirmando" && !aceite) return;

    setLoading(true);
    setErro(null);
    try {
      const resultado = await inscreverSessao(sessao!.id);
      if (resultado.checkoutUrl) {
        window.location.href = resultado.checkoutUrl;
      } else {
        window.open(MIX_WA_LINK, "_blank");
        onClose();
      }
    } catch (e: unknown) {
      setErro((e as { message?: string })?.message ?? "Erro ao criar inscrição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!sessao} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="max-w-sm border"
        style={{ background: "#0d0e12", borderColor: "rgba(245,158,11,0.22)" }}
      >
        <DialogTitle className="font-display text-lg font-black uppercase italic tracking-tight text-white">
          Garantir Vaga — {JOGO_CONFIG[sessao.jogo].label}
        </DialogTitle>

        <div className="mt-1 space-y-[1px]">
          {([
            ["Mix", `${JOGO_CONFIG[sessao.jogo].label} — Santos Games Arena`],
            ["Data prevista", `${dataFmt} às ${sessao.horario}`],
            ["Modalidade", sessao.modalidade === "presencial" ? "Presencial" : "Online"],
            ["Vagas restantes", String(vagasRestantes)],
          ] as [string, string][]).map(([lbl, val]) => (
            <div key={lbl} className="flex justify-between items-center py-2 border-b border-white/[0.05]">
              <span className="text-[10px] uppercase tracking-[0.1em] text-white/35">{lbl}</span>
              <span className="text-xs font-bold text-white">{val}</span>
            </div>
          ))}
        </div>

        {sessao.status === "confirmando" && (
          <div className="mt-3 bg-amber-500/[0.08] border border-amber-500/20 p-3">
            <p className="text-[11px] text-amber-400/90 leading-relaxed">
              ⚠ A data pode ajustar até o grupo fechar. Se não puder na nova data: reembolso integral ou troca por outro mix.
            </p>
          </div>
        )}

        {!user ? (
          <div className="mt-4 space-y-2">
            <button
              onClick={handleParticipar}
              className="w-full py-3 text-[11px] font-black uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-85"
              style={{ background: cor }}
            >
              Entrar para Participar →
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 border border-white/[0.08] hover:text-white/50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {sessao.status === "confirmando" && (
              <label className="flex gap-2 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={e => setAceite(e.target.checked)}
                  className="mt-0.5 accent-amber-500"
                />
                <span className="text-[11px] text-white/30 leading-relaxed">
                  Concordo que a data pode ser ajustada até o grupo fechar e estou ciente da política de reembolso.
                </span>
              </label>
            )}
            {erro && <p className="text-[11px] text-red-400">{erro}</p>}
            <button
              onClick={handleParticipar}
              disabled={(sessao.status === "confirmando" && !aceite) || loading || vagasRestantes <= 0}
              className="w-full py-3 text-[11px] font-black uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: cor }}
            >
              {loading ? "Aguarde…" : vagasRestantes <= 0 ? "Lotado" : "Ir para o Checkout →"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 border border-white/[0.08] hover:text-white/50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

function MixPage() {
  const [sessoes, setSessoes] = useState<MixSessao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sessaoSelecionada, setSessaoSelecionada] = useState<MixSessao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { trackWhatsAppClick } = useAnalytics();

  useEffect(() => {
    fetchSessoes()
      .then(data => {
        setSessoes(data);
        const intentId = sessionStorage.getItem(INTENT_KEY);
        if (intentId) {
          sessionStorage.removeItem(INTENT_KEY);
          const alvo = data.find(s => s.id === Number(intentId));
          if (alvo) {
            setSessaoSelecionada(alvo);
            setModalAberto(true);
            return;
          }
        }
        if (data.length > 0) setSessaoSelecionada(data[0]);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#06070a]">
      <div className="bg-[#0d0e12] border-b-2 border-amber-500 px-7 py-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.18em] mb-2">
            ⚡ Jogatina em Grupo
          </div>
          <h1 className="font-display text-4xl font-black uppercase italic tracking-tighter leading-none text-white">
            MIX <span style={{ color: AMBER }}>SGA</span>
          </h1>
          <p className="mt-1 text-[10px] text-white/35 uppercase tracking-[0.12em]">
            CS2 · Valorant · LoL · Santos Games Arena
          </p>
        </div>
        <a
          href={MIX_WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("mix")}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#25d366] text-[#25d366] text-xs font-bold uppercase tracking-wide hover:bg-[#25d366]/10 transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Suporte
        </a>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-24 text-white/30 text-xs uppercase tracking-widest">
          Carregando…
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-90px)]">
          <Calendario
            sessoes={sessoes}
            sessaoSelecionada={sessaoSelecionada}
            onSelecionarSessao={setSessaoSelecionada}
          />
          <SidebarMixes
            sessoes={sessoes}
            sessaoSelecionada={sessaoSelecionada}
            onSelecionarSessao={setSessaoSelecionada}
            onParticipar={s => { setSessaoSelecionada(s); setModalAberto(true); }}
          />
        </div>
      )}

      <ModalCheckout
        sessao={modalAberto ? sessaoSelecionada : null}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}
