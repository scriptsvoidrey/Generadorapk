"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NAV_ITEMS } from "./nav-items";
import { playClick } from "@/lib/client/sound";

/** Navegación inferior fija para móvil (< md). */
export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav className="bottom-nav" aria-label="Navegación móvil">
      {NAV_ITEMS.map(({ href, shortLabel, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`bn-item ${isActive(href) ? "active" : ""}`}
          onClick={() => playClick()}
          aria-label={shortLabel}
        >
          <Icon size={20} />
          <span>{shortLabel}</span>
        </Link>
      ))}
    </nav>
  );
}
