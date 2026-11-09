"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileIcon, X } from "lucide-react";
import { formatBytes } from "@/lib/client/api";
import { playClick } from "@/lib/client/sound";

interface FileDropzoneProps {
  accept?: string;
  maxSizeMB?: number;
  onFile: (file: File | null) => void;
  file: File | null;
  title?: string;
  hint?: string;
}

export function FileDropzone({
  accept,
  maxSizeMB = 50,
  onFile,
  file,
  title = "Arrastra tu archivo aquí",
  hint = "o haz clic para seleccionarlo",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
      return `El archivo supera el límite de ${maxSizeMB} MB.`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validate(f);
    if (err) {
      setError(err);
      onFile(null);
      return;
    }
    setError(null);
    onFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onClick={() => {
          playClick();
          inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {!file ? (
          <>
            <div className="dz-icon">
              <UploadCloud size={36} />
            </div>
            <div className="dz-title">{title}</div>
            <div className="small faint">{hint}</div>
            {accept && <div className="small faint mt-1">Formatos: {accept}</div>}
          </>
        ) : (
          <div className="dz-file">
            <FileIcon size={16} color="var(--accent)" />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {file.name}
            </span>
            <span className="small faint">{formatBytes(file.size)}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-label="Quitar archivo"
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                onFile(null);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
