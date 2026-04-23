import { Button } from "./Button";
import type { ComponentProps } from "react";

export function ResetLevelButton({
  children = "Сбросить уровень",
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button variant="danger" {...props}>
      {children}
    </Button>
  );
}
