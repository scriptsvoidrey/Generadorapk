// Capa de almacenamiento. Driver "local" por defecto (escribe en ./storage).
// Si STORAGE_DRIVER=vercel-blob y BLOB_READ_WRITE_TOKEN existe, intenta usar
// @vercel/blob (import dinámico; si no está instalado, cae a local con log).
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || "50", 10) || 50;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const MAX_ICON_BYTES = 2 * 1024 * 1024; // 2 MB

const STORAGE_ROOT = path.join(process.cwd(), "storage");

type BlobPut = (
  pathname: string,
  body: Buffer | Readable,
  options?: { access: "public"; contentType?: string },
) => Promise<{ url: string }>;

let blobPut: BlobPut | null = null;
let blobChecked = false;

async function getBlobPut(): Promise<BlobPut | null> {
  if (blobChecked) return blobPut;
  blobChecked = true;
  if (process.env.STORAGE_DRIVER !== "vercel-blob" || !process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }
  try {
    // @ts-ignore - dependencia opcional, puede no estar instalada
    const mod = await import("@vercel/blob");
    blobPut = mod.put as BlobPut;
    console.log("[storage] Usando driver vercel-blob");
    return blobPut;
  } catch {
    console.warn(
      "[storage] STORAGE_DRIVER=vercel-blob pero @vercel/no está instalado o falta token; usando driver local.",
    );
    return null;
  }
}

function ensureDir(subdir: string): string {
  const dir = path.join(STORAGE_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function isBlobRef(ref: string): boolean {
  return /^https?:\/\//i.test(ref);
}

export const storage = {
  /** Guarda un buffer. Devuelve la referencia (ruta relativa local o URL blob). */
  async saveBuffer(
    filename: string,
    buf: Buffer,
    subdir: string,
  ): Promise<string> {
    if (buf.length > MAX_UPLOAD_BYTES) {
      throw new Error(`Archivo excede el límite de ${MAX_UPLOAD_MB} MB`);
    }
    const put = await getBlobPut();
    if (put) {
      const { url } = await put(`${subdir}/${filename}`, buf, { access: "public" });
      return url;
    }
    const dir = ensureDir(subdir);
    const abs = path.join(dir, filename);
    fs.writeFileSync(abs, buf);
    return `${subdir}/${filename}`;
  },

  /** Guarda un stream. Devuelve la referencia. */
  async saveStream(
    filename: string,
    stream: Readable,
    subdir: string,
    expectedBytes?: number,
  ): Promise<string> {
    if (expectedBytes && expectedBytes > MAX_UPLOAD_BYTES) {
      throw new Error(`Archivo excede el límite de ${MAX_UPLOAD_MB} MB`);
    }
    const put = await getBlobPut();
    if (put) {
      const { url } = await put(`${subdir}/${filename}`, stream, { access: "public" });
      return url;
    }
    const dir = ensureDir(subdir);
    const abs = path.join(dir, filename);
    await new Promise<void>((resolve, reject) => {
      const out = fs.createWriteStream(abs);
      let written = 0;
      stream.on("data", (chunk: Buffer) => {
        written += chunk.length;
        if (written > MAX_UPLOAD_BYTES) {
          stream.destroy();
          out.destroy();
          fs.unlink(abs, () => {});
          reject(new Error(`Archivo excede el límite de ${MAX_UPLOAD_MB} MB`));
          return;
        }
      });
      stream.pipe(out);
      out.on("finish", () => resolve());
      out.on("error", reject);
      stream.on("error", reject);
    });
    return `${subdir}/${filename}`;
  },

  /** Ruta absoluta local (solo driver local). Para blob devuelve la URL pública. */
  getAbsolutePath(ref: string): string {
    if (isBlobRef(ref)) return ref;
    return path.join(STORAGE_ROOT, ref);
  },

  /** Devuelve un web ReadableStream para descargar el archivo. */
  async getDownloadStream(ref: string): Promise<ReadableStream<Uint8Array>> {
    if (isBlobRef(ref)) {
      const res = await fetch(ref);
      if (!res.ok || !res.body) {
        throw new Error("No se pudo leer el archivo almacenado");
      }
      return res.body;
    }
    const abs = path.join(STORAGE_ROOT, ref);
    if (!fs.existsSync(abs)) {
      throw new Error("Archivo no encontrado en almacenamiento");
    }
    const nodeStream = fs.createReadStream(abs);
    return Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
  },

  existsSync(ref: string): boolean {
    if (isBlobRef(ref)) return true; // no comprobamos remotamente
    return fs.existsSync(path.join(STORAGE_ROOT, ref));
  },
};
