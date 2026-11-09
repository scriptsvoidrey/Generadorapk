"use client";

import { useRef, useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { playClick } from "@/lib/client/sound";

interface IconUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
}

export function IconUpload({ file, onChange, maxSizeMB = 2 }: IconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handle = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      setError("Solo se permiten imágenes PNG, JPG o WebP.");
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`El icono supera el límite de ${maxSizeMB} MB.`);
      return;
    }
    setError(null);
    onChange(f);
  };

  return (
    <div>
      <div
        className="icon-upload"
        onClick={() => {
          playClick();
          inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="Subir icono de la aplicación"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={(e) => handle(e.target.files)}
        />
        {preview ? (
          <>
            <img src={preview} alt="Vista previa del icono" />
            <button
              type="button"
              className="iu-remove"
              aria-label="Quitar icono"
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <div className="iu-placeholder">
            <ImagePlus size={22} />
            <span>Icono</span>
          </div>
        )}
      </div>
      {error && <span className="field-error" style={{ display: "block", marginTop: 6 }}>{error}</span>}
      {!error && (
        <span className="field-hint" style={{ marginTop: 6, display: "block" }}>
          PNG o JPG · máx. {maxSizeMB} MB · se adapta a todos los tamaños
        </span>
      )}
    </div>
  );
}
