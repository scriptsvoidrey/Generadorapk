import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
  href?: string | null;
}

/** Marca NEXA: marca geométrica con gradiente morado→azul→cian + tipografía. */
export function Logo({ size = 36, showText = true, href = "/" }: LogoProps) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <polygon
        points="96,130 416,130 470,256 416,382 96,382 42,256"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="26"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M 180 340 L 180 172 L 332 340 L 332 172"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="392" cy="140" r="22" fill="#06b6d4" />
    </svg>
  );

  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {mark}
      {showText && (
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: size * 0.5,
              letterSpacing: "0.08em",
              background: "var(--gradient)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            NEXA
          </span>
          <span
            style={{
              fontSize: size * 0.22,
              letterSpacing: "0.32em",
              color: "var(--text-faint)",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            APK STUDIO
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex" }}>
      {inner}
    </Link>
  );
}
