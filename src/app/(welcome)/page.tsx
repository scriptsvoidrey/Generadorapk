"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Code2,
  ShieldCheck,
  CloudLightning,
  ArrowRight,
  PlayCircle,
  PackageCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { playClick, unlockAudio } from "@/lib/client/sound";

const FEATURES = [
  {
    Icon: Zap,
    title: "En minutos",
    desc: "Pega una URL, tu HTML o sube un ZIP y recibe un APK instalable sin tocar Android Studio.",
  },
  {
    Icon: Code2,
    title: "Tu código, tu app",
    desc: "WebView moderno con JavaScript, almacenamiento, geolocalización y permisos a medida.",
  },
  {
    Icon: CloudLightning,
    title: "Compilación en la nube",
    desc: "GitHub Actions compila y firma tu APK en servidores escalables. Sin SDK local.",
  },
  {
    Icon: ShieldCheck,
    title: "Seguro y privado",
    desc: "Tus fuentes se cifran en tránsito y solo tú puedes descargar tus aplicaciones.",
  },
];

export default function WelcomePage() {
  const { status } = useSession();
  const router = useRouter();

  const startHref = status === "authenticated" ? "/app" : "/login";

  const handleStart = () => {
    unlockAudio();
    playClick();
    router.push(startHref);
  };

  const handleHow = () => {
    playClick();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="hero">
      <div className="hero-grid-bg" />
      <div className="hero-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="hero-content">
        <div className="anim-in" style={{ marginBottom: 28 }}>
          <Logo size={72} showText={false} href={null} />
        </div>
        <div className="anim-in delay-1 badge badge-info" style={{ marginBottom: 22 }}>
          <PackageCheck size={13} />
          Generador de APK sin código nativo
        </div>
        <h1
          className="anim-in delay-2"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", marginBottom: 16 }}
        >
          <span className="gradient-text">NEXA APK STUDIO</span>
        </h1>
        <p
          className="anim-in delay-3"
          style={{
            fontSize: "clamp(1.05rem, 2.4vw, 1.4rem)",
            color: "var(--text-dim)",
            maxWidth: 620,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Convierte tus ideas en aplicaciones Android. Desde una URL, código HTML o un archivo
          ZIP hasta un APK listo para instalar, en minutos.
        </p>
        <div className="hero-cta anim-in delay-4">
          <Button variant="primary" size="lg" onClick={handleStart} icon={<ArrowRight size={18} />}>
            Comenzar ahora
          </Button>
          <Button variant="secondary" size="lg" onClick={handleHow} icon={<PlayCircle size={18} />}>
            Ver cómo funciona
          </Button>
        </div>
      </div>

      <section id="features" className="features-section">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}>
            Todo lo que necesitas para <span className="gradient-text">publicar en Android</span>
          </h2>
          <p className="muted" style={{ maxWidth: 560, margin: "0 auto" }}>
            Sin configurar entornos, sin Gradle en tu máquina, sin conocimientos de Kotlin.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <Card key={f.title} className={`feature-card anim-in delay-${(i % 4) + 1}`}>
              <div className="fc-icon">
                <f.Icon size={22} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Card>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Button variant="primary" size="lg" onClick={handleStart} icon={<ArrowRight size={18} />}>
            Crear mi primera APK
          </Button>
        </div>
      </section>
    </main>
  );
}
