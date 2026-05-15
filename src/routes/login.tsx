import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  // useAuth: Hook do Zustand para gerenciamento de estado global.
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");

  /**
   * Ponto de Integração de API:
   * Para autenticação real, utilize 'useMutation' do TanStack Query aqui.
   * Exemplo: const { mutate, isPending } = useMutation({ mutationFn: api.login })
   * O objeto 'login' deve ser chamado no callback 'onSuccess'.
   */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: Substitua por chamada à API de autenticação.
    // Adicionado o campo 'role' para que o sistema reconheça o nível de acesso Administrador.
    login(
      { 
        name: email.includes("willian") ? "Willian" : "Player", 
        email, 
        role: email.includes("willian") ? "Administrador" : "Jogador",
        avatar: "https://picsum.photos/seed/me/80/80" 
      },
      "mock-token-123"
    );
    toast.success("Bem-vindo de volta à arena!");
    nav({ to: "/" });
  };
  return (
    <div className="relative min-h-[90vh] grid place-items-center bg-[#06070a] overflow-hidden px-4 py-12">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(248,109,131,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Access
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md group"
      >
        {/* HUD Accents */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-white/10 group-hover:border-primary/40 transition-colors" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-white/10 group-hover:border-primary/40 transition-colors" />

        <form onSubmit={submit} className="relative rounded-none border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md shadow-2xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[8px] font-black text-white/5 uppercase tracking-[0.4em] pointer-events-none">
            Secure_Login // Protocol_4.1
          </div>

          <div className="flex items-center justify-between gap-3 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-end gap-3">
              <img src="https://santos-games.com/encontre-um-time/assets/sga-logo-B5SOul8E.png" alt="SGA Logo" className="h-12 w-auto" />
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary pb-1 italic">Auth_Gate</div>
            </div>
            <div className="flex gap-2 items-center opacity-60 font-display text-[10px] uppercase">
              <span className="text-primary">Valorant</span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-neon">CS2</span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-warning">CS</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-black italic uppercase tracking-tight text-white mb-2">Entrar na <span className="text-primary">Arena</span></h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-8 italic">Inicie sua sessão competitiva_</p>

          <div className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Identificação (Email)</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="player@sga.gg" className="pl-10 rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Chave de Acesso (Senha)</Label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input type="password" required placeholder="••••••••" className="pl-10 rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            </div>
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground cursor-pointer hover:text-white transition-colors italic"><Checkbox className="rounded-none" /> Manter Protocolo Ativo</label>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(248,109,131,0.2)] h-12 uppercase tracking-[0.2em] font-black italic">Acessar Sistema</Button>
          </div>
          <div className="my-6 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic"><div className="flex-1 h-px bg-white/5" /> Ou utilize <div className="flex-1 h-px bg-white/5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={submit} className="rounded-none border-white/10 hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest italic">Discord</Button>
            <Button type="button" variant="outline" onClick={submit} className="rounded-none border-white/10 hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest italic">Google</Button>
          </div>
          <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-muted-foreground italic">Sem credenciais? <Link to="/register" className="text-primary hover:text-white transition-colors font-black">Criar Identidade</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
