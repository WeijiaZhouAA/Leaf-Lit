import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClass =
  "w-full px-4 py-2.5 border border-sage rounded-xl text-body placeholder:text-muted focus:outline-none focus:border-fresh focus:ring-2 focus:ring-fresh/20 text-sm bg-white disabled:bg-surface disabled:text-muted";

export function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-body">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} resize-none ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "yellow" | "danger" }) {
  const styles = {
    primary: "bg-forest text-white hover:bg-forest-light",
    secondary: "border border-sage text-body hover:bg-surface",
    ghost: "text-body hover:bg-mint",
    yellow: "bg-yellow text-forest border border-yellow-deep hover:bg-yellow-deep",
    danger: "text-red-500 hover:text-red-600",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    />
  );
}
