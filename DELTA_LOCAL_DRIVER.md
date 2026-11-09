# DELTA — Compilación LOCAL por defecto (BUILD_DRIVER)

Modificación sobre el backend de NEXA APK STUDIO. GitHub driver y rutas de
callback (`/source`, `/status`, `/apk`) intactos.

## Verificación
- `npx tsc --noEmit`: **0 errores** en todo el proyecto.
- `npm run build` (prisma generate + next build): **exit 0**. Las 12 rutas API + middleware aparecen en el output.
- `github.ts` sin modificar; rutas `builds/[id]/{source,status,apk}/route.ts` intactas.
- Sin TODO/placeholder/simulación: la única coincidencia de "simula" es el comentario `NO simula compilaciones`.
- `scripts/setup-android.sh`: `bash -n` OK, ejecutable.
- No se añadió ninguna dependencia.

## Archivos NUEVOS
- `src/lib/server/build-driver-local.ts` — cola en memoria + worker async serie; `enqueueLocalBuild()` (retorna inmediato), `buildLocal()` (PREPARING → copia android-template a tmp → configure-android.mjs → gradle assembleDebug con log a archivo → guarda APK en storage/apks o ERROR con tail ~2000 bytes; limpia tmp best-effort); `isLocalConfigured()` (ANDROID_HOME existe); recuperación best-effort al cargar módulo (re-encola builds QUEUED/PREPARING/BUILDING, solo si driver≠github).
- `scripts/setup-android.sh` — idempotente: instala JDK17 Temurin (Adoptium), Android cmdline-tools + platform-tools + platforms;android-34 + build-tools;34.0.0, Gradle 8.7 bajo `~/.nexa/`; actualiza `.env` (BUILD_DRIVER=local, ANDROID_HOME, JAVA_HOME, GRADLE_HOME); detecta Linux/macOS/arch; Windows → instrucción WSL.
- `GUIA_RAPIDA.md` — flujo local por defecto (npm install → cp .env → setup-android.sh → db:push → dev), cuándo usar GitHub.

## Archivos MODIFICADOS
- `src/lib/server/build-engine.ts` — añadidos `activeDriver()` y `dispatchBuild()` (elige local|github; mensajes: local no configurado → "Ejecuta bash scripts/setup-android.sh..."; github → instrucciones actuales).
- `src/app/api/builds/route.ts` — POST usa `dispatchBuild`; respuesta incluye `driver`.
- `src/app/api/pipeline/status/route.ts` — devuelve `{configured, driver, message?, repository?}`.
- `.env` y `.env.example` — `BUILD_DRIVER="local"` por defecto + comentarios ANDROID_HOME/JAVA_HOME/GRADLE_HOME.
- `README.md` — secciones 1/2/3/5/6 actualizadas (local por defecto; GitHub solo para serverless).

## Notas de implementación / decisiones
- `buildLocal` siempre pasa `SOURCE_ZIP` (configure-android.mjs lo requiere); además extrae `nexa_config.json` del zip → `START_URL` por env, y `icon.png` → `ICON_PATH` por env (cumple el spec y es robusto).
- Si el fuente está en vercel-blob (URL), el driver local lo descarga al tmp antes de compilar.
- `gradle` se resuelve desde `GRADLE_HOME/bin/gradle` si existe, si no desde `PATH`.
- En serverless (Vercel) con BUILD_DRIVER=local el worker no sobrevive al request; por eso la doc indica `github` para serverless. No se marca ningún build como exitoso sin compilar de verdad.
