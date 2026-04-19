import type { ComponentType } from "react";
import { Level1 } from "./levels/Level1";
import { Level2 } from "./levels/Level2";
import { Level3 } from "./levels/Level3";
import { Level4 } from "./levels/Level4";
import { Level5 } from "./levels/Level5";

export const LEVEL_COMPONENTS: Record<
  string,
  ComponentType<{ onSuccess: () => void }>
> = {
  "1": Level1,
  "2": Level2,
  "3": Level3,
  "4": Level4,
  "5": Level5,
};
