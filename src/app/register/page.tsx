"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, UserPlus, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { api } from "@/lib/client/api";
import { useToast } from "@/lib/client/hooks";
import { playError, playSuccess } from "@/lib/client/sound";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Introduce tu nombre.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Introduce un email válido.");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");

    setLoading(true);
    try {
      await api.post("/api/auth/register", { name: name.trim(), email, password });
      // Inicia sesión automáticamente tras el registro
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/app",
      });
      if (res?.error) {
        toast.info("Cuenta creada. Inicia sesión.");
        router.push("/login");
      } else {
        playSuccess();
        toast.success("Cuenta creada. ¡Bienvenido a NEXA!");
        router.push("/app");
        router.refresh();
      }
    } catch (err) {
      playError();
      const msg = err instanceof Error ? err.message : "No se pudo crear la cuenta.";
      setError(msg.includes("409") || msg.toLowerCase().includes("existe")
        ? "Ya existe una cuenta con ese email."
        : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <div className="hero-orbs" aria-hidden="true">
        <div className="orb orb-1" style={{ opacity: 0.3 }} />
        <div className="orb orb-3" style={{ opacity: 0.25 }} />
      </div>
      <Card className="auth-card anim-in">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Logo size={44} href={null} />
        </div>
        <h1>Crear cuenta</h1>
        <p className="auth-sub">Empieza a compilar APKs en segundos</p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Nombre"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            icon={<User size={16} />}
            required
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            icon={<Lock size={16} />}
            required
            hint="Usa al menos 8 caracteres."
          />
          {error && (
            <div className="alert alert-error mb-2" role="alert">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" variant="primary" block loading={loading} icon={<UserPlus size={16} />}>
            Crear cuenta
          </Button>
        </form>

        <p className="small muted" style={{ textAlign: "center", marginTop: 20, marginBottom: 0 }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
