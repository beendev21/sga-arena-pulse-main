import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateBR(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTimeBR(date: string | Date) {
  return format(new Date(date), "dd/MM", { locale: ptBR });
}

export function getCurrentYear() {
  return new Date().getFullYear().toString();
}
