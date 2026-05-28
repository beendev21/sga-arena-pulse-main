import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Search, LogOut, Menu, X, Bell, Play } from "lucide-react";
import { useAuth } from "@/store/auth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Ranking", to: "/tournaments" },
    { name: "Times", to: "/teams" },
    { name: "Partidas", to: "/matches" },
    { name: "Jogadores", to: "/players" },
    { name: "Chaveamento", to: "/bracket" },
    { name: "Highlights", to: "/highlights" },
    { name: "Galeria", to: "/gallery" },
  ];

  return (
    <header>
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-10 h-full">
          <Link to="/" className="flex items-center gap-3 group outline-none">
            <div className="relative h-11 w-11 bg-primary flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:scale-110 shadow-[0_0_20px_oklch(0.6_0.25_25_/_0.3)] group-hover:shadow-[0_0_25px_white]">
              <span className="font-display text-white group-hover:text-black text-xl font-black italic transition-colors">SGA</span>
              <div className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 border-primary group-hover:border-white transition-colors" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 border-primary group-hover:border-white transition-colors" />
            </div>
            <div className="flex flex-col border-l border-white/10 pl-3">
              <span className="font-display text-xl font-black leading-none tracking-tighter text-white">SGA</span>
              <span className="font-display text-[10px] text-primary/80 font-bold leading-none tracking-[0.25em] uppercase mt-1">Santos Games Arena</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center h-full">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to as any}
                activeProps={{ className: "active" }}
                className="nav-link-glow"
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* HUD ACTIONS */}
        <div className="flex items-center gap-4 h-full">
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center relative group">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground/40 z-10 transition-all group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Buscar times, jogadores..."
              className="search-hud"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex p-2.5 text-muted-foreground/40 hover:text-white transition-all border border-transparent hover:bg-white/5 relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_var(--primary)]" />
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-3 pl-2 group relative">
                <div className="flex flex-col items-end hidden md:flex select-none">
                  <span className="text-sm font-bold text-white leading-none">{user.name || user.login}</span>
                  <span className="text-[11px] text-primary font-semibold tracking-wide uppercase leading-none mt-1">{user.role === "Administrador" ? "Admin" : "Jogador"}</span>
                </div>
                <div className="relative">
                  <div className="h-9 w-9 border border-primary/40 p-0.5 group-hover:border-primary transition-colors">
                    <img
                      src={user.avatar || "/avatar-default.svg"}
                      alt={user.name || user.login}
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (!target.src.endsWith("/avatar-default.svg")) {
                          target.src = "/avatar-default.svg";
                        }
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-[#0a0a0c] rounded-full" />
                </div>
                <button onClick={() => logout()} title="Sair" className="p-2 text-muted-foreground/60 hover:text-primary transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <button className="btn-slanted flex items-center gap-2 group">
                  <Play className="h-3 w-3 fill-current transition-transform group-hover:translate-x-0.5" />
                  <span>Entrar</span>
                </button>
              </Link>
            )}

            {/* MOBILE TRIGGER */}
            <button 
              className="xl:hidden p-2.5 bg-white/5 text-muted-foreground hover:text-white transition-all border border-white/5 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      {isMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-20 bg-[#0a0a0c] z-50 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col p-6 gap-1 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold tracking-wide text-primary/60 uppercase">Menu</div>
              {user && (
                <span className="text-xs text-white/60 font-semibold flex items-center gap-2">
                  {user.name || user.login}
                  <span className="inline-block h-2 w-2 bg-green-500 rounded-full" />
                </span>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to as any}
                className="py-4 border-b border-white/[0.04] text-sm font-bold tracking-wide text-white/80 hover:text-white hover:bg-primary/5 hover:pl-4 transition-all flex items-center justify-between group uppercase"
              >
                {link.name}
                <Play className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {user ? (
              <button onClick={() => logout()} className="mt-auto py-5 text-sm font-bold tracking-wide text-primary hover:text-white transition-all flex items-center justify-between border-t border-white/5 uppercase">
                Sair <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link to="/login" className="mt-auto border-t border-white/5">
                <button className="btn-slanted w-full flex items-center justify-center gap-2 group py-4 mt-5">
                  <Play className="h-3 w-3 fill-current transition-transform group-hover:translate-x-0.5" />
                  <span>Entrar</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}