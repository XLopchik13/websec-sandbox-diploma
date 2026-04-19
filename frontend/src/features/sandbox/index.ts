import { Level1 } from "./levels/Level1";
import { Level2 } from "./levels/Level2";
import { Level3 } from "./levels/Level3";
import { Level4 } from "./levels/Level4";
import type { SandboxLevel } from "@/entities/sandbox/types";

export const SANDBOX_LEVELS: SandboxLevel[] = [
  {
    id: "1",
    title: "Уровень 1: Stored XSS",
    description: "Выполните произвольный JavaScript через поле комментариев",
    component: Level1,
  },
  {
    id: "2",
    title: "Уровень 2: SQL Injection",
    description: "Получите доступ к скрытой записи admin через форму поиска",
    component: Level2,
  },
  {
    id: "3",
    title: "Уровень 3: IDOR",
    description: "Получите доступ к приватному профилю администратора",
    component: Level3,
  },
  {
    id: "4",
    title: "Уровень 4: Broken Authentication",
    description:
      "Подмените алгоритм подписи токена и получите права администратора",
    component: Level4,
  },
];
