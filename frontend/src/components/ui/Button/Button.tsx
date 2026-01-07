import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "link";
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass = variant === "primary" ? "" : styles[variant];

  return (
    <button
      className={`${styles.button} ${variantClass || ""} ${className}`.trim()}
      {...props}
    />
  );
}
