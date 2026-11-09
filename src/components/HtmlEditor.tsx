"use client";

import { useMemo, useRef } from "react";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/** Resaltado mínimo de HTML por regex: comentarios · etiquetas · texto. */
function highlightHtml(src: string): React.ReactNode[] {
  if (!src) return [];
  const nodes: React.ReactNode[] = [];
  const re = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][^>]*>)|([^<]+)/g;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(src)) !== null) {
    if (m[1]) {
      nodes.push(
        <span key={key++} className="he-comment">
          {m[1]}
        </span>
      );
    } else if (m[2]) {
      nodes.push(
        <span key={key++} className="he-tag">
          {m[2]}
        </span>
      );
    } else if (m[3]) {
      nodes.push(
        <span key={key++} className="he-text">
          {m[3]}
        </span>
      );
    }
  }
  return nodes;
}

export function HtmlEditor({ value, onChange, placeholder, minHeight = 260 }: HtmlEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(() => Math.max(1, value.split("\n").length), [value]);
  const highlighted = useMemo(() => highlightHtml(value + "\n"), [value]);

  const syncScroll = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  };

  const lines = Array.from({ length: lineCount }, (_, i) => (
    <span key={i}>{i + 1}</span>
  ));

  return (
    <div className="html-editor">
      <div className="he-body">
        <div className="he-gutter" ref={gutterRef}>
          {lines}
        </div>
        <div className="he-code-wrap">
          <pre ref={preRef} className="he-highlight" aria-hidden="true">
            <code>{highlighted}</code>
          </pre>
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            style={{ height: minHeight }}
          />
        </div>
      </div>
      <div className="he-status">
        <span>{lineCount} líneas</span>
        <span>{value.length} caracteres</span>
      </div>
    </div>
  );
}
