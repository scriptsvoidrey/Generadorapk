"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { LoadingScreen } from "@/components/Spinner";
import { useToast } from "@/lib/client/hooks";
import { playError, playSuccess } from "@/lib/client/sound";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackUrl = params.get("callbackUrl") || "/app";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Introduce email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        playError();
        setError("Email o contraseña incorrectos.");
      } else {
        playSuccess();
        toast.success("Sesión iniciada");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      playError();
      setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      const res = await signIn("google", { redirect: false, callbackUrl });
      if (res?.error) {
        playError();
        setGoogleError(
          "El proveedor de Google no está configurado en este servidor. Usa email y contraseña, o contacta al administrador."
        );
      } else if (res?.url) {
        window.location.href = res.url;
        return;
      }
    } catch {
      playError();
      setGoogleError("No se pudo conectar con Google. Inténtalo de nuevo.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <div className="hero-orbs" aria-hidden="true">
        <div className="orb orb-1" style={{ opacity: 0.3 }} />
        <div className="orb orb-2" style={{ opacity: 0.25 }} />
      </div>
      <Card className="auth-card anim-in">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Logo size={44} href={null} />
        </div>
        <h1>Iniciar sesión</h1>
        <p className="auth-sub">Accede a tu estudio de compilación APK</p>

        <Button
          variant="secondary"
          block
          onClick={handleGoogle}
          loading={googleLoading}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
          }
        >
          Continuar con Google
        </Button>

        {googleError && (
          <div className="alert alert-warning mt-2" role="alert">
            <AlertTriangle size={16} />
            <span>{googleError}</span>
          </div>
        )}

        <div className="divider">o con email</div>

        <form onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            required
          />
          {error && (
            <div className="alert alert-error mb-2" role="alert">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" variant="primary" block loading={loading} icon={<LogIn size={16} />}>
            Entrar
          </Button>
        </form>

        <p className="small muted" style={{ textAlign: "center", marginTop: 20, marginBottom: 0 }}>
          ¿No tienes cuenta?{" "}
          <Link href="/register" style={{ fontWeight: 600 }}>
            Regístrate gratis
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }}><LoadingScreen text="Cargando…" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
