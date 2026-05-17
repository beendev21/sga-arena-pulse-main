import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import useApiController from "@/API/controler";

export function GalleryGrid() {
  const api = useApiController("Gallery");
  const { data: raw, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: () => api.getAll()
  });

  const parse = useCallback((r: any) => {
    if (!r) return [];
    return Array.isArray(r) ? r : (r?.result || []);
  }, []);

  const gallery = useMemo(() => parse(raw), [raw, parse]);

  if (isLoading) return <div className="p-10 text-center font-display uppercase opacity-20 animate-pulse italic">Acessando arquivos de imagem...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {gallery.map((src, i) => (
        <div key={i} className={`relative overflow-hidden rounded-xl group ${i % 5 === 0 ? "row-span-2 col-span-2" : ""}`}>
          <img src={src} alt="" className="h-full w-full object-cover aspect-square group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}
