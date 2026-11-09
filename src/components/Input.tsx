"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <div className="field">
      {label && <label className="label">{label}</label>}
      {children}
      {error && <span className="field-error">{error}</span>}
      {!error && hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Input({ label, error, hint, icon, className = "", ...rest }: InputProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span style={{ position: "absolute", left: 12, color: "var(--text-faint)", display: "flex" }}>
            {icon}
          </span>
        )}
        <input
          {...rest}
          className={`input ${error ? "error" : ""} ${className}`.trim()}
          style={icon ? { paddingLeft: 40 } : undefined}
        />
      </div>
    </Field>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = "", ...rest }: TextareaProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      <textarea {...rest} className={`textarea ${error ? "error" : ""} ${className}`.trim()} />
    </Field>
  );
}
