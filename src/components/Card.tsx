import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hoverable?: boolean;
  as?: "div" | "section" | "article";
}

export function Card({ children, className = "", style, hoverable, as = "div" }: CardProps) {
  const Tag = as;
  return (
    <Tag className={`card ${hoverable ? "hoverable" : ""} ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
