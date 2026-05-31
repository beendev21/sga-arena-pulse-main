import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CustomCursor } from "@/components/CustomCursor";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ cursor: 'none' }}>
      <CustomCursor />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
