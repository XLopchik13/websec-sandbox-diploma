import type { ComponentType } from "react";
import { Level1 } from "./levels/Level1";
import { Level2 } from "./levels/Level2";
import { Level3 } from "./levels/Level3";
import { Level4 } from "./levels/Level4";
import { Level5 } from "./levels/Level5";
import { Level6 } from "./levels/Level6";
import { Level7 } from "./levels/Level7";
import { Level8 } from "./levels/Level8";
import { Level9 } from "./levels/Level9";
import { Level10 } from "./levels/Level10";
import { Level11 } from "./levels/Level11";

export const LEVEL_COMPONENTS: Record<
  string,
  ComponentType<{ onSuccess: () => void }>
> = {
  "1": Level1,
  "2": Level2,
  "3": Level3,
  "4": Level4,
  "5": Level5,
  "6": Level6,
  "7": Level7,
  "8": Level8,
  "9": Level9,
  "10": Level10,
  "11": Level11,
};
