const MIX_API_URL =
  (import.meta.env.VITE_MIX_API_URL as string | undefined)?.trim() ||
  "https://painel-adm.santos-tech.com";

export type MixSessao = {
  id: number;
  jogo: "cs2" | "valorant" | "lol";
  dataPrevista: string; // "YYYY-MM-DD"
  horario: string;      // "HH:MM"
  modalidade: "presencial" | "online";
  totalVagas: number;
  vagasPreenchidas: number;
  status: "confirmando" | "confirmado" | "realizado" | "cancelado";
  precoCents: number;
};

export type MixInscricao = {
  id: number;
  status: "pendente" | "confirmado" | "cancelado";
  createdAt: string;
  sessao: {
    id: number;
    jogo: MixSessao["jogo"];
    dataPrevista: string;
    horario: string;
    modalidade: MixSessao["modalidade"];
    statusSessao: MixSessao["status"];
  };
};

export async function fetchSessoes(): Promise<MixSessao[]> {
  const res = await fetch(`${MIX_API_URL}/api/mix/public/sessoes`);
  if (!res.ok) throw new Error("Erro ao buscar sessões de mix.");
  const data = await res.json() as { sessoes: MixSessao[] };
  return data.sessoes;
}

export async function inscreverSessao(
  sessaoId: number
): Promise<{ inscricaoId: number; checkoutUrl: string | null; message: string }> {
  const res = await fetch(`${MIX_API_URL}/api/mix/sessoes/${sessaoId}/inscrever`, {
    method: "POST",
    credentials: "include"
  });
  const data = await res.json() as { inscricaoId?: number; checkoutUrl?: string | null; message: string };
  if (!res.ok) throw new Error(data.message || "Erro ao criar inscrição.");
  return { inscricaoId: data.inscricaoId!, checkoutUrl: data.checkoutUrl ?? null, message: data.message };
}

export async function fetchMinhasInscricoes(): Promise<MixInscricao[]> {
  const res = await fetch(`${MIX_API_URL}/api/mix/minhas-inscricoes`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Erro ao buscar inscrições.");
  const data = await res.json() as { inscricoes: MixInscricao[] };
  return data.inscricoes;
}
