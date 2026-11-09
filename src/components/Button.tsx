"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";
import { playClick, unlockAudio } from "@/lib/client/sound";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

interface ButtonAsLink extends CommonProps {
  href: string;
  onClick?: () => void;
  children: ReactNode;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const sizeClass: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

export function Button(props: ButtonProps) {
  const { variant = "secondary", size = "md", block, loading, icon, className = "" } = props;
  const classes = `btn ${variantClass[variant]} ${sizeClass[size]} ${block ? "btn-block" : ""} ${className}`.trim();
  const inner = (
    <>
      {loading ? <Spinner /> : icon}
      {props.children}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={classes}
        onClick={() => {
          unlockAudio();
          playClick();
          props.onClick?.();
        }}
        aria-busy={loading}
      >
        {inner}
      </Link>
    );
  }

  const { href: _h, icon: _i, loading: _l, variant: _v, size: _s, block: _b, className: _c, ...btnProps } =
    props as ButtonAsButton;
  void _h; void _i; void _l; void _v; void _s; void _b; void _c;

  return (
    <button
      {...btnProps}
      className={classes}
      disabled={btnProps.disabled || loading}
      onClick={(e) => {
        unlockAudio();
        playClick();
        btnProps.onClick?.(e);
      }}
      aria-busy={loading}
    >
      {inner}
    </button>
  );
}
