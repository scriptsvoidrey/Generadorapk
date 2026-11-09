"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./nav-items";
import { playClick } from "@/lib/client/sound";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <Logo size={34} href="/app" />
      <nav className="nav">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? "active" : ""}`}
            onClick={() => playClick()}
          >
            <Icon size={19} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        NEXA APK STUDIO · v1.0
        <br />
        Compilación en la nube
      </div>
    </aside>
  );
}
