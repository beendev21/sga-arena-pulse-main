import { Link } from "@tanstack/react-router";
import { Trophy, Twitter, Twitch, Youtube, Instagram } from "lucide-react";
import { getCurrentYear } from "@/lib/dateUtils";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-[1500px] px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 grid place-items-center bg-neon clip-slant shadow-neon">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display tracking-widest">SGA</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Santos Games Arena</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            A casa do e-sport competitivo. Campeonatos, ranking e comunidade em um só lugar.
          </p>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Plataforma</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tournaments" className="hover:text-primary">Ranking</Link></li>
            <li><Link to="/teams" className="hover:text-primary">Times</Link></li>
            <li><Link to="/players" className="hover:text-primary">Jogadores</Link></li>
            <li><Link to="/bracket" className="hover:text-primary">Chaveamento</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Conta</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-primary">Entrar</Link></li>
            <li><Link to="/register" className="hover:text-primary">Cadastrar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Social</h4>
          <div className="flex gap-3 text-muted-foreground">
            <Twitter className="h-5 w-5 hover:text-primary cursor-pointer" />
            <Twitch className="h-5 w-5 hover:text-primary cursor-pointer" />
            <Youtube className="h-5 w-5 hover:text-primary cursor-pointer" />
            <Instagram className="h-5 w-5 hover:text-primary cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {getCurrentYear()} Santos Games Arena — MVP demonstrativo. Dados fictícios.
      </div>
    </footer>
  );
}
