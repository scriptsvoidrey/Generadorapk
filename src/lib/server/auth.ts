// Configuración de NextAuth v4: Credentials (email+password con bcrypt) +
// Google (solo si GOOGLE_CLIENT_ID/SECRET están configurados). Sesión JWT;
// los callbacks adjuntan userId al token y a la sesión.
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "./db";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toString().trim().toLowerCase();
      const password = credentials?.password?.toString();
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return null; // cuenta Google sin contraseña
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({ clientId: googleClientId, clientSecret: googleClientSecret }),
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Upsert de usuario al iniciar sesión con Google.
      if (account?.provider === "google" && user?.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              image: user.image ?? null,
              provider: "google",
              passwordHash: null,
            },
          });
        } else {
          // Completa imagen/nombre si faltan (no sobrescribe passwordHash).
          if (!existing.image || !existing.name) {
            await prisma.user.update({
              where: { email },
              data: {
                image: existing.image ?? user.image ?? null,
                name: existing.name || user.name || email.split("@")[0],
              },
            });
          }
        }
        const dbUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (dbUser) (user as { id?: string }).id = dbUser.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        let userId = (user as { id?: string }).id;
        // Respaldo: si el proveedor no adjuntó id, buscar por email.
        if (!userId && token.email) {
          const db = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
            select: { id: true },
          });
          if (db) userId = db.id;
        }
        if (userId) token.userId = userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
        (session as { userId?: string }).userId = token.userId as string;
      }
      return session;
    },
  },
};

/** Devuelve el userId de la sesión actual o null. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session as { userId?: string } | null)?.userId ?? null;
}
