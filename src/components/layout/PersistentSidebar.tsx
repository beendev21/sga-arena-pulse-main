import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home, Trophy, Swords, User, LayoutDashboard, Image as ImgIcon,
  Gamepad2, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { usePreferences } from "@/store/preferences";
import { SgaAnimatedLogo } from "@/components/SgaAnimatedLogo";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenuDropdown } from "@/components/layout/UserMenuDropdown";

const NAV_ITEMS = [
  { to: "/",             label: "Home",      icon: Home },
  { to: "/tournaments",  label: "Ranking",   icon: Trophy },
  { to: "/matches",      label: "Partidas",  icon: Swords },
  { to: "/players",      label: "Jogadores", icon: User },
  { to: "/gallery",      label: "Galeria",   icon: ImgIcon },
  { to: "/play/corujao", label: "Corujão",   icon: Gamepad2 },
];
const ADMIN_ITEM = { to: "/admin", label: "Admin", icon: LayoutDashboard };

const COLLAPSED_W = 64;
const EXPANDED_W  = 224;

function NavItemLink({
  to, label, icon: Icon, expanded,
}: { to: string; label: string; icon: React.ElementType; expanded: boolean }) {
  const content = (
    <Link
      to={to as any}
      activeProps={{ className: "active" }}
      className="flex items-center gap-3 px-[18px] py-3 text-muted-foreground/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent [&.active]:border-primary [&.active]:text-white [&.active]:bg-primary/10 transition-colors w-full overflow-hidden"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span
        style={{ transition: "opacity 0.2s ease, transform 0.2s ease" }}
        className={`text-xs font-black uppercase tracking-widest whitespace-nowrap ${
          expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
        }`}
      >
        {label}
      </span>
    </Link>
  );

  if (expanded) return content;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="font-black uppercase tracking-widest text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function PersistentSidebar() {
  const user    = useAuth((s) => s.user);
  const isAdmin = useAuth((s) => s.isAdmin);

  const sidebarAutoExpand = usePreferences((s) => s.sidebarAutoExpand);
  const [pinned,  setPinned]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const expanded = pinned || (sidebarAutoExpand && hovered);
  const w        = expanded ? EXPANDED_W : COLLAPSED_W;
  const items    = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  return (
    <TooltipProvider>
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: w, transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-[80] flex-col bg-[#080809] border-r border-white/[0.06] overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center px-[18px] h-16 shrink-0 border-b border-white/[0.06]">
          <Link to="/" className="shrink-0 relative h-8 flex items-center">
            <img
              src="/assets/favicon.svg"
              alt="SGA"
              className="h-8 w-8 rounded-md"
              style={{ transition: "opacity 0.15s ease", opacity: expanded ? 0 : 1, pointerEvents: expanded ? "none" : "auto" }}
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ transition: "opacity 0.15s ease", opacity: expanded ? 1 : 0, pointerEvents: expanded ? "auto" : "none" }}
            >
              <SgaAnimatedLogo className="h-7 w-auto" />
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {items.map((item) => (
            <NavItemLink key={item.to} {...item} expanded={expanded} />
          ))}

        </nav>

        {/* User + toggle */}
        <div className="shrink-0 border-t border-white/[0.06]">
          {user ? (
            <UserMenuDropdown side="right" align="end">
              <button className="w-full flex items-center gap-2 px-3 py-3 hover:bg-white/5 transition-colors overflow-hidden focus:outline-none">
                <div className="h-8 w-8 shrink-0 border border-primary/40 overflow-hidden bg-primary/15 grid place-items-center">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.login} className="h-full w-full object-cover" />
                    : <span className="font-display text-xs font-black text-primary uppercase">
                        {(user.name || user.login || "?").split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("")}
                      </span>
                  }
                </div>
                <div
                  style={{ transition: "opacity 0.2s ease, transform 0.2s ease" }}
                  className={`flex-1 min-w-0 text-left ${
                    expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                  }`}
                >
                  <div className="text-xs font-bold text-white truncate">{user.name || user.login}</div>
                  <div className="text-[10px] text-primary font-semibold uppercase tracking-wide">
                    {user.role === "Administrador" ? "Admin" : "Jogador"}
                  </div>
                </div>
              </button>
            </UserMenuDropdown>
          ) : (
            <Link to="/login" className="flex items-center justify-center px-3 py-3 text-primary hover:bg-primary/10 transition-colors">
              <span
                style={{ transition: "opacity 0.2s ease" }}
                className={`text-xs font-black uppercase tracking-widest ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                Entrar
              </span>
            </Link>
          )}

          {/* Pin button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setPinned((v) => !v)}
                className="w-full flex items-center justify-center px-3 py-2.5 text-muted-foreground/30 hover:text-white hover:bg-white/5 transition-colors border-t border-white/[0.04]"
              >
                {pinned
                  ? <PanelLeftClose className="h-3.5 w-3.5" />
                  : <PanelLeftOpen  className="h-3.5 w-3.5" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="text-xs">
              {pinned ? "Recolher sidebar" : "Fixar expandida"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
