# GUÍA RÁPIDA — NEXA APK STUDIO (compilación local por defecto)

No necesitas cuenta de GitHub ni Google OAuth para usar NEXA. Por defecto
(`BUILD_DRIVER=local`) los APK se compilan **en tu propia máquina**.

## Flujo por defecto (local)

```bash
# 1. Dependencias de Node
npm install

# 2. Variables de entorno
cp .env.example .env
#   edita NEXTAUTH_SECRET (openssl rand -base64 32); el resto funciona con los valores por defecto.

# 3. (Una sola vez) Instala JDK 17 + Android SDK + Gradle 8.7 bajo ~/.nexa/
#    En Windows: usa WSL (Ubuntu) y corre el script dentro de WSL.
bash scripts/setup-android.sh

# 4. Base de datos
npm run db:push

# 5. Arrancar
npm run dev   # http://localhost:3000
```

Luego: regístrate con **email y contraseña** (Google es opcional), ve a
**Crear APK**, sube tu web (URL / HTML pegado / archivo HTML / ZIP) y pulsa
compilar. El APK se genera en tu máquina (estado en vivo: En espera →
Preparando → Compilando → Completado) y lo descargas desde el detalle del build.

> Si no ejecutas `setup-android.sh`, los builds quedan en "En espera" y la app
> te muestra el aviso: *"Ejecuta bash scripts/setup-android.sh..."*. No se inventa
> ningún APK exitoso.

## Cuándo usar GitHub Actions en su lugar

Solo si despliegas en **Vercel / serverless** (allí no hay Android SDK ni disco
persistente). Entonces:

1. Pon `BUILD_DRIVER=github` en `.env`.
2. Configura `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `PUBLIC_BASE_URL` (alcanzable
   desde internet; `localhost` no le sirve a GitHub).
3. Sube `android-template/`, `scripts/` y `.github/workflows/build-apk.yml` a un
   repo builder y define la variable `PUBLIC_BASE_URL` en ese repo.
4. En Vercel usa `STORAGE_DRIVER=vercel-blob` y Postgres (SQLite local no sirve).

Las rutas de callback `/api/builds/[id]/source|status|apk` siguen activas para
este modo.

## Re-instalar / limpiar

- El script `setup-android.sh` es idempotente: vuelve a correrlo sin riesgo.
- Para desinstalar las herramientas: `rm -rf ~/.nexa` y quita `ANDROID_HOME`,
  `JAVA_HOME`, `GRADLE_HOME` de `.env`.

## Notas

- Login con Google: opcional. Si `GOOGLE_CLIENT_ID` está vacío, el botón de
  Google muestra un aviso y puedes usar email+contraseña sin problema.
- Los APK generados son **debug firmados** (instalables directamente en Android
  activando "Orígenes desconocidos"). Para release firmado necesitas tu propio
  keystore (fuera del alcance de esta guía).
