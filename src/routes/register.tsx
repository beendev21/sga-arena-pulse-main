import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const nav = useNavigate();
  const login = useAuth((s) => s.login);
  // Gerenciamento de formulário via estado. Para formulários complexos, considere 'react-hook-form'.
  const [form, setForm] = useState({ name: "", nick: "", email: "", password: "" });
  
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  
  /**
   * Integração com API:
   * Enviar dados para POST /api/auth/register.
   */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ name: form.name, nick: form.nick, email: form.email, avatar: `https://picsum.photos/seed/${form.nick}/80/80` });
    toast.success("Conta criada — boa sorte na arena!");
    nav({ to: "/" });
  };
  return (
    <div className="relative min-h-[90vh] grid place-items-center bg-[#06070a] overflow-hidden px-4 py-12">
      {/* Background Layers */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,163,255,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Massive Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Ident
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
            Enlistment_Module // Registry_v2.0
          </div>

          <div className="flex items-center justify-between gap-3 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-end gap-3">
              <img src="https://santos-games.com/encontre-um-time/assets/sga-logo-B5SOul8E.png" alt="SGA Logo" className="h-12 w-auto" />
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-valorant pb-1 italic">New_Agent</div>
            </div>
            <div className="flex gap-2 items-center opacity-60 font-display text-[10px] uppercase">
              <span className="text-primary">Valorant</span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-neon">CS2</span>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-warning">CS</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-black italic uppercase tracking-tight text-white mb-2">Criar sua <span className="text-primary">Identidade</span></h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-8 italic">Junte-se à elite da arena_</p>

          <div className="space-y-4">
            <div><Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Nome Real</Label><Input required value={form.name} onChange={upd("name")} className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            <div><Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Nome de Guerra (Nick)</Label><Input required value={form.nick} onChange={upd("nick")} className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            <div><Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Email de Contato</Label><Input type="email" required value={form.email} onChange={upd("email")} className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            <div><Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Chave de Acesso (Senha)</Label><Input type="password" required value={form.password} onChange={upd("password")} className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            <div><Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground italic mb-1.5 block">Avatar (URL)</Label><Input placeholder="Opcional" className="rounded-none border-white/10 bg-white/5 focus:border-primary transition-all placeholder:text-white/10" /></div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(248,109,131,0.2)] h-12 mt-4 uppercase tracking-[0.2em] font-black italic">Finalizar Alistamento</Button>
          </div>
          <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-muted-foreground italic">Já possui registro? <Link to="/login" className="text-primary hover:text-white transition-colors font-black">Entrar na Base</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
