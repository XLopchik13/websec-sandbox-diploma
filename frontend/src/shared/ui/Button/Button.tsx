import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "link" | "ghost" | "secondary";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantClass = variant === "primary" ? "" : styles[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`${styles.button} ${variantClass || ""} ${loading ? styles.loading : ""} ${className}`.trim()}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
