import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { redirectToAuth } from "@/lib/auth-redirect";

export const Route = createFileRoute("/register")({ component: RegisterRedirect });

function RegisterRedirect() {
  useEffect(() => {
    redirectToAuth("/register");
  }, []);

  return (
    <div className="grid min-h-[80vh] place-items-center bg-[#06070a] text-muted-foreground">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Redirecionando para Santos Games
      </div>
    </div>
  );
}
