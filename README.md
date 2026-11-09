# NEXA APK STUDIO

Plataforma web que convierte proyectos web (URL, HTML, archivo HTML o ZIP) en APK Android reales, descargables e instalables.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma (SQLite por defecto) + NextAuth v4
- Gradle + Android SDK para compilar APK
- Interfaz en español, tema oscuro, PWA instalable

## Instalación local

```bash
npm install
cp .env.example .env
bash scripts/setup-android.sh
npm run db:push
npm run dev
```

Requiere Node.js 20+ y npm. Para compilar APK localmente, instalar JDK 17, Android SDK y Gradle con el script setup.

## Configuración

Configura en `.env` variables como `NEXTAUTH_SECRET`, `DATABASE_URL`, `BUILD_DRIVER` (`local` o `github`), y según despliegue `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `BUILD_CALLBACK_SECRET`, `PUBLIC_BASE_URL`.

## Pipeline APK

El proyecto ofrece driver local y driver GitHub Actions. La compilación reporta estados reales: En espera, Preparando, Compilando, Completado o Error. No se simula la generación del APK.

## Documentación

Consulta `GUIA_RAPIDA.md`, `CONTRACT.md`, `BACKEND_ENTREGA.md` y `DELTA_LOCAL_DRIVER.md` para detalles del proyecto.

## Seguridad

Validación de entradas con zod, contraseñas con bcryptjs, sesiones JWT, endpoints de runner autenticados por token y límites de subida.