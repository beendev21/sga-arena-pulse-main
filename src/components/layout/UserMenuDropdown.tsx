import { Link, useNavigate } from "@tanstack/react-router";
import { User, Shield, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/auth";

const AUTH_URL = ((import.meta as any).env?.VITE_AUTH_URL as string | undefined)?.trim()?.replace(/\/$/, "") ?? "";

type Props = {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  onOpenChange?: (open: boolean) => void;
};

export function UserMenuDropdown({ children, side = "bottom", align = "end", onOpenChange }: Props) {
  const user     = useAuth((s) => s.user);
  const logout   = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  async function handleLogout() {
    if (AUTH_URL) await fetch(`${AUTH_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    logout();
    navigate({ to: "/" });
  }

  const menuItem = "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium cursor-pointer rounded-none hover:bg-white/5 transition-colors outline-none";

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-56 bg-[#0e0f14] border border-white/[0.08] p-0 shadow-2xl z-[110]"
      >
        {/* Header — nome + email */}
        <div className="px-3 py-3 border-b border-white/[0.06]">
          <p className="text-sm font-bold text-white leading-none">{user.name || user.login}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
        </div>

        {/* Links */}
        <div className="py-1">
          <DropdownMenuItem asChild className={menuItem}>
            <Link to="/profile" className={menuItem}>
              <User className="h-4 w-4 text-muted-foreground/60" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={menuItem}>
            <Link to="/settings" className={menuItem}>
              <Shield className="h-4 w-4 text-muted-foreground/60" />
              <span>Segurança</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={menuItem}>
            <Link to="/settings" className={menuItem}>
              <Settings className="h-4 w-4 text-muted-foreground/60" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-white/[0.06]" />

        {/* Sair */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className={`${menuItem} text-destructive hover:text-destructive hover:bg-destructive/10 focus:text-destructive`}
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
