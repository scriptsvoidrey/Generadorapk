import {
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/app", label: "Inicio", icon: LayoutDashboard },
  { href: "/app/crear", label: "Crear APK", icon: PlusCircle },
  { href: "/app/historial", label: "Historial", icon: History },
  { href: "/app/configuracion", label: "Configuración", icon: Settings },
  { href: "/app/ayuda", label: "Ayuda", icon: HelpCircle },
  { href: "/app/cuenta", label: "Cuenta", icon: User },
] as const;
