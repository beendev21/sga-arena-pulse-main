import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Home, Trophy, Swords, User, LayoutDashboard, Image as ImgIcon } from "lucide-react";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Ranking", url: "/tournaments", icon: Trophy },
  { title: "Partidas", url: "/matches", icon: Swords },
  { title: "Jogadores", url: "/players", icon: User },
  { title: "Galeria", url: "/gallery", icon: ImgIcon },
  { title: "Admin", url: "/admin", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas" className="z-[110] border-none">
      <SidebarContent className="bg-[#0b0c11] border-none [will-change:transform] overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-white/40 font-black uppercase italic tracking-[0.2em] text-[10px] px-6 pt-12 pb-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={() => setOpenMobile(false)} className="h-auto p-0">
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-4 px-5 py-4 rounded-none hover:bg-primary/5 active:scale-[0.98] transition-all font-display text-sm italic uppercase font-black tracking-widest text-white/70 hover:text-white group-data-[active=true]:text-primary group-data-[active=true]:bg-primary/5 group-data-[active=true]:border-l-2 group-data-[active=true]:border-primary"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-data-[active=true]:text-primary transition-colors" />
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