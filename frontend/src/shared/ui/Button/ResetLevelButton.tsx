import type React from "react";
import { Button } from "./Button";

export function ResetLevelButton({
  children = "Сбросить уровень",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="danger" {...props}>
      {children}
    </Button>
  );
}
