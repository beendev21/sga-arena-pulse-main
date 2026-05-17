interface Team {
  tag?: string | null;
  name?: string | null;
  bannerColor?: string | null;
  logo?: string;
  logoUrl?: string;
  imageUrl?: string;
}

function resolveTeamLogoSrc(team?: Team | null) {
  if (!team) return "";
  return team.logoUrl || team.logo || team.imageUrl || "";
}

export function TeamLogo({ team, size = 40 }: { team?: Team | null; size?: number }) {
  const safeTeam = team ?? {};
  const logoSrc = resolveTeamLogoSrc(team);
  const bannerColor = safeTeam.bannerColor || "oklch(0.22 0.05 275)";
  const label = String(safeTeam.tag || safeTeam.name || "SGA")
    .trim()
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className="relative grid place-items-center clip-slant shadow-neon"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${bannerColor}, oklch(0.2 0.04 290))`,
      }}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={String(safeTeam.tag || safeTeam.name || "Equipe")}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span
          className="font-display font-bold text-primary-foreground"
          style={{ fontSize: size * 0.35 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
