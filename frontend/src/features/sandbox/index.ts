import { Level1 } from "./levels/Level1";
import type { SandboxLevel } from "@/entities/sandbox/types";

export const SANDBOX_LEVELS: SandboxLevel[] = [
  {
    id: "1",
    title: "Уровень 1",
    description: "Простая XSS уязвимость в поле комментариев",
    component: Level1,
  },
];
