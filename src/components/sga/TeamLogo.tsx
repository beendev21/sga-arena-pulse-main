interface Team {
  tag: string;
  bannerColor: string;
  logo?: string;
}

export function TeamLogo({ team, size = 40 }: { team: Team; size?: number }) {
  return (
    <div
      className="relative grid place-items-center clip-slant shadow-neon"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${team.bannerColor}, oklch(0.2 0.04 290))`,
      }}
    >
      <span className="font-display font-bold text-primary-foreground" style={{ fontSize: size * 0.35 }}>
        {team.tag}
      </span>
    </div>
  );
}
