"use client";

import Link from "next/link";
import { Download, ChevronRight, FileCode2, Link2, FileArchive, Globe } from "lucide-react";
import { Card } from "./Card";
import { StatusBadge } from "./Badge";
import { Button } from "./Button";
import { formatBytes, formatDateEs } from "@/lib/client/api";
import type { BuildDTO, ContentType } from "@/lib/types";
import { playClick } from "@/lib/client/sound";

const contentTypeLabel: Record<ContentType, { label: string; Icon: typeof Globe }> = {
  URL: { label: "URL", Icon: Link2 },
  HTML_PASTE: { label: "HTML", Icon: FileCode2 },
  HTML_FILE: { label: "Archivo HTML", Icon: FileCode2 },
  ZIP: { label: "ZIP", Icon: FileArchive },
};

export function BuildCard({ build }: { build: BuildDTO }) {
  const ct = contentTypeLabel[build.contentType];
  const CTIcon = ct.Icon;

  const handleDownload = (e: React.MouseEvent) => {
    if (!build.hasApk) {
      e.preventDefault();
      return;
    }
    playClick();
  };

  return (
    <Card hoverable className="build-row">
      <div className="br-main">
        <div className="br-name">
          <CTIcon size={16} color="var(--text-faint)" />
          <span>{build.appName}</span>
          <StatusBadge status={build.status} />
        </div>
        <div className="br-meta">
          <span className="mono">{build.packageName}</span>
          <span>
            v{build.versionName} ({build.versionCode})
          </span>
          <span>{formatDateEs(build.createdAt)}</span>
          <span>{ct.label}</span>
          {build.apkSize ? <span>{formatBytes(build.apkSize)}</span> : null}
        </div>
      </div>
      <div className="br-actions">
        {build.hasApk && build.status === "COMPLETED" && (
          <a
            href={`/api/builds/${build.id}/download`}
            download
            onClick={handleDownload}
            className="btn btn-primary btn-sm"
            style={{ textDecoration: "none" }}
          >
            <Download size={14} />
            APK
          </a>
        )}
        <Link
          href={`/app/historial/${build.id}`}
          className="btn btn-secondary btn-sm"
          onClick={() => playClick()}
          style={{ textDecoration: "none" }}
        >
          Detalles
          <ChevronRight size={14} />
        </Link>
      </div>
    </Card>
  );
}
