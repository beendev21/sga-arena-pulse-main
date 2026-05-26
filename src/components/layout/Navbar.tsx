import { Link } from "@tanstack/react-router";
import { Bell, Menu, Play, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/tournaments", label: "Ranking" },
  { to: "/teams", label: "Times" },
  { to: "/matches", label: "Partidas" },
  { to: "/players", label: "Jogadores" },
  { to: "/bracket", label: "Chaveamento" },
  { to: "/highlights", label: "Highlights" },
];

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <header className="fixed top-0 inset-x-0 z-[100] h-20 w-full border-b border-white/5 bg-[#0a0a0c] [transform:translateZ(0)] shadow-2xl">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-6">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-4 h-full">
          <button 
            onClick={toggleSidebar} 
            className="xl:hidden p-2 text-primary hover:bg-primary/10 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-3 group outline-none">
            <img
              src="/sga-logo.png"
              alt="Santos Games Arena"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col border-l border-white/10 pl-3">
              <span className="font-display text-base font-black leading-none tracking-tight text-white uppercase whitespace-nowrap">Santos Games</span>
              <span className="font-display text-xs text-primary font-bold leading-none tracking-wider uppercase mt-1 whitespace-nowrap">Arena</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center h-full">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                activeProps={{ className: "active" }}
                className="nav-link-glow"
              >
                <span>{l.label}</span>
              </Link>
            ))}

            <Link
              to="/gallery"
              activeProps={{ className: "active" }}
              className="nav-link-glow"
            >
              <span>Galeria</span>
            </Link>

            {/* JOGAR DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link-glow flex items-center gap-1.5 group outline-none">
                  <span>Jogar</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={0}
                className="min-w-[160px] border border-white/10 bg-[#0e0e11] p-1 shadow-2xl"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/play/corujao"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-primary/10 cursor-pointer outline-none transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Corujão
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/play/mix"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-primary/10 cursor-pointer outline-none transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Mix
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user?.role === "Administrador" && (
              <Link
                to="/admin"
                activeProps={{ className: "active" }}
                className="nav-link-glow"
              >
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4 h-full">

          <div className="flex items-center gap-2 h-full">
            <button
              className="hidden sm:flex p-2.5 text-muted-foreground/60 hover:text-white transition-all border border-transparent hover:bg-white/5 relative"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_var(--primary)]" />
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-3 pl-2 group relative">
                <div className="flex flex-col items-end hidden lg:flex select-none">
                  <span className="text-sm font-bold text-white leading-none">{user.name || user.login}</span>
                  <span className="text-[11px] text-primary font-semibold tracking-wide uppercase leading-none mt-1">{user.role === "Administrador" ? "Admin" : "Jogador"}</span>
                </div>
                {user.role === "Administrador" && (
                  <Link
                    to="/admin"
                    title="Painel Admin"
                    className="p-2 text-muted-foreground/60 hover:text-primary transition-colors border border-transparent hover:bg-white/5"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                )}
                <Link to="/profile">
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
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sair"
                  className="p-2 text-muted-foreground/60 hover:text-primary transition-colors"
                >
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
          </div>
        </div>
      </div>
    </header>
  );
}
