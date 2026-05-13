import { Link } from "@tanstack/react-router";
import { Bell, Search, Menu, Play, LogOut } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/store/auth";

const links = [
  { to: "/", label: "Home", index: "01" },
  { to: "/tournaments", label: "Ranking", index: "02" },
  { to: "/teams", label: "Times", index: "03" },
  { to: "/matches", label: "Partidas", index: "04" },
  { to: "/players", label: "Jogadores", index: "05" },
  { to: "/bracket", label: "Chaveamento", index: "06" },
  { to: "/highlights", label: "Highlights", index: "07" },
  { to: "/gallery", label: "Galeria", index: "08" },
];

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <header className="fixed top-0 inset-x-0 z-[100] h-20 w-full border-b border-white/5 bg-[#0a0a0c] [transform:translateZ(0)] shadow-2xl">
      <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-6">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-8 h-full">
          <button 
            onClick={toggleSidebar} 
            className="xl:hidden p-2 text-primary hover:bg-primary/10 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-3 group outline-none">
            <div className="relative h-11 w-11 bg-primary flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:scale-110 shadow-[0_0_20px_oklch(0.6_0.25_25_/_0.3)] group-hover:shadow-[0_0_25px_white]">
              <span className="font-display text-white group-hover:text-black text-xl font-black italic transition-colors">SGA</span>
              <div className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 border-primary group-hover:border-white transition-colors" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 border-primary group-hover:border-white transition-colors" />
            </div>
            <div className="flex flex-col border-l border-white/10 pl-3 hidden sm:flex">
              <span className="font-display text-xl font-black leading-none tracking-tighter text-white">SGA</span>
              <span className="font-display text-[8px] text-primary/80 font-bold leading-none tracking-[0.4em] italic uppercase mt-1">Santos Games Arena</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden xl:flex items-center h-full">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                activeProps={{ className: "active" }}
                className="nav-link-glow group/nav"
              >
                <span className="text-[7px] opacity-30 font-black group-hover/nav:text-primary group-hover/nav:opacity-100 transition-all">{l.index}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* HUD ACTIONS */}
        <div className="flex items-center gap-4 h-full">
          <div className="hidden md:flex items-center relative group">
            <Search className="absolute left-4 h-3.5 w-3.5 text-muted-foreground/30 z-10 transition-all group-focus-within:text-primary group-focus-within:scale-110" />
            <input 
              type="text" 
              placeholder="SGA // SEARCH_HUD" 
              className="search-hud"
            />
          </div>

          <div className="flex items-center gap-2 h-full">
        <button 
              className="hidden sm:flex p-2.5 text-muted-foreground/40 hover:text-white transition-all border border-transparent hover:bg-white/5 relative"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_5px_var(--primary)]" />
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-3 pl-2 group relative">
                <div className="flex flex-col items-end hidden lg:flex select-none">
                  <span className="text-[10px] font-black text-white italic leading-none">{user.nick}</span>
                  <span className="text-[8px] text-primary font-bold tracking-widest uppercase leading-none mt-1">Authorized Player</span>
                </div>
                <div className="relative">
                  <div className="h-9 w-9 border border-primary/40 p-0.5 group-hover:border-primary transition-colors">
                    <img src={user.avatar} alt={user.nick} className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-[#0a0a0c] rounded-full" />
                </div>
                <button 
                  onClick={() => logout()} 
                  title="Sair" 
                  className="p-2 text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <button className="btn-slanted flex items-center gap-2 group">
                  <Play className="h-3 w-3 fill-current transition-transform group-hover:translate-x-0.5" />
                  <span>Login</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
