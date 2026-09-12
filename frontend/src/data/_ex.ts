import { Exercise } from "../types";

type Req =
  | "id"
  | "name"
  | "group"
  | "equipment"
  | "level"
  | "pattern"
  | "view"
  | "muscles"
  | "instructions"
  | "mistakes"
  | "easier"
  | "noEquip";

export const mk = (e: Partial<Exercise> & Pick<Exercise, Req>): Exercise => ({
  sets: 3,
  reps: "10-12",
  restSec: 60,
  kneeSafety: "permitido",
  implement: "none",
  jumping: false,
  highImpact: false,
  deepKnee: false,
  ...e,
});
