import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Home, Trophy, Swords, User, LayoutDashboard, Image as ImgIcon, X, Gamepad2 } from "lucide-react";
import { useAuth } from "@/store/auth";

const baseItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Ranking", url: "/tournaments", icon: Trophy },
  { title: "Partidas", url: "/matches", icon: Swords },
  { title: "Jogadores", url: "/players", icon: User },
  { title: "Galeria", url: "/gallery", icon: ImgIcon },
];

const adminItem = { title: "Admin", url: "/admin", icon: LayoutDashboard };

const playItems = [
  { title: "Corujão", url: "/play/corujao" },
  { title: "Mix", url: "/play/mix" },
];

export function AppSidebar() {
  const { setOpenMobile, setOpen } = useSidebar();
  const isAdmin = useAuth((s) => s.isAdmin);
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  const close = () => {
    setOpenMobile(false);
    setOpen(false);
  };

  return (
    <Sidebar collapsible="offcanvas" className="z-[90] border-none">
      <SidebarContent className="bg-[var(--sidebar)] border-none overflow-x-hidden">
        {/* Spacer que fica atrás da navbar fixa (h-20 = 80px) */}
        <div className="h-20 shrink-0" />

        {/* Header com botão de fechar — aparece logo abaixo da navbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-white/60">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Fechar menu"
            className="h-9 w-9 grid place-items-center text-white/80 hover:text-white hover:bg-white/10 active:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Jogar */}
        <SidebarGroup>
          <SidebarGroupContent className="px-2 pt-3">
            <div className="flex items-center gap-2 px-5 pb-2">
              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-primary">Jogar</span>
            </div>
            <SidebarMenu className="gap-0.5">
              {playItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={close} className="h-auto p-0">
                    <Link
                      to={item.url}
                      className="flex items-center gap-4 px-5 py-3.5 rounded-none hover:bg-primary/5 active:scale-[0.98] transition-all font-display text-sm uppercase font-bold tracking-wide text-white/80 hover:text-white border-l-2 border-primary/30 hover:border-primary group-data-[active=true]:text-primary group-data-[active=true]:bg-primary/5 group-data-[active=true]:border-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Nav principal */}
        <SidebarGroup>
          <SidebarGroupContent className="px-2 pt-1 border-t border-white/[0.06]">
            <SidebarMenu className="gap-1 pt-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={close} className="h-auto p-0">
                    <Link
                      to={item.url}
                      className="flex items-center gap-4 px-5 py-4 rounded-none hover:bg-primary/5 active:scale-[0.98] transition-all font-display text-sm uppercase font-bold tracking-wide text-white/80 hover:text-white group-data-[active=true]:text-primary group-data-[active=true]:bg-primary/5 group-data-[active=true]:border-l-2 group-data-[active=true]:border-primary"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-data-[active=true]:text-primary transition-colors" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
