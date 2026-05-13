import { gallery } from "@/mocks/data";

export function GalleryGrid() {
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
