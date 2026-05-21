import { Link } from "@tanstack/react-router";
import { Twitter, Twitch, Youtube, Instagram, MapPin, Mail } from "lucide-react";
import { getCurrentYear } from "@/lib/dateUtils";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-[var(--surface-1)]">
      <div className="mx-auto max-w-[1500px] px-6 py-14 grid gap-10 md:grid-cols-12">
        {/* Marca + descrição */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <img src="/sga-logo.png" alt="Santos Games Arena" className="h-12 w-auto" />
            <div>
              <div className="font-display text-xl font-black tracking-tight text-white uppercase">Santos Games Arena</div>
              <div className="text-sm text-muted-foreground font-medium">A casa do e-sport competitivo</div>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-md">
            Campeonatos, ranking e comunidade gamer reunidos em um só lugar. Competimos em CS2, Valorant e League of Legends.
          </p>

          {/* Selos dos jogos */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jogos:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-cs2/15 text-cs2 border border-cs2/30">CS2</span>
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-valorant/15 text-valorant border border-valorant/30">Valorant</span>
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-lol/15 text-lol border border-lol/30">LoL</span>
            </div>
          </div>
        </div>

        {/* Plataforma */}
        <div className="md:col-span-2">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">Plataforma</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/tournaments" className="text-muted-foreground hover:text-primary transition-colors font-medium">Campeonatos</Link></li>
            <li><Link to="/teams" className="text-muted-foreground hover:text-primary transition-colors font-medium">Times</Link></li>
            <li><Link to="/players" className="text-muted-foreground hover:text-primary transition-colors font-medium">Jogadores</Link></li>
            <li><Link to="/matches" className="text-muted-foreground hover:text-primary transition-colors font-medium">Partidas</Link></li>
            <li><Link to="/bracket" className="text-muted-foreground hover:text-primary transition-colors font-medium">Chaveamento</Link></li>
          </ul>
        </div>

        {/* Comunidade */}
        <div className="md:col-span-2">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">Comunidade</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/highlights" className="text-muted-foreground hover:text-primary transition-colors font-medium">Highlights</Link></li>
            <li><Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors font-medium">Galeria</Link></li>
            <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors font-medium">Entrar</Link></li>
            <li><Link to="/register" className="text-muted-foreground hover:text-primary transition-colors font-medium">Criar conta</Link></li>
          </ul>
        </div>

        {/* Contato + Redes */}
        <div className="md:col-span-4">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">Contato</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span className="font-medium">Santos · São Paulo, Brasil</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <a href="mailto:contato@santosgamesarena.com.br" className="font-medium hover:text-primary transition-colors break-all">
                contato@santosgamesarena.com.br
              </a>
            </li>
          </ul>

          <div className="mt-6">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Siga a SGA</div>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="h-10 w-10 grid place-items-center bg-[var(--surface-2)] border border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitch" className="h-10 w-10 grid place-items-center bg-[var(--surface-2)] border border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Twitch className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="h-10 w-10 grid place-items-center bg-[var(--surface-2)] border border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="h-10 w-10 grid place-items-center bg-[var(--surface-2)] border border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1500px] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground font-medium">
            © {getCurrentYear()} Santos Games Arena. Todos os direitos reservados.
          </div>
          <div className="text-muted-foreground/70 text-xs font-medium">
            Plataforma desenvolvida para a comunidade gamer.
          </div>
        </div>
      </div>
    </footer>
  );
}
