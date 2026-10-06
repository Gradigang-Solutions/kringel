import { acidLine } from "@/demos/acidLine";
import { dustyKeys } from "@/demos/dustyKeys";
import { firstTechno } from "@/demos/firstTechno";
import { slowTide } from "@/demos/slowTide";
import type { Project } from "@/model/types";

export interface Demo {
  readonly project: Project;
  readonly genre: string;
}

export const DEMOS: readonly Demo[] = [
  { project: firstTechno, genre: "Techno" },
  { project: dustyKeys, genre: "Lo-fi hip-hop" },
  { project: acidLine, genre: "Acid techno" },
  { project: slowTide, genre: "Ambient" },
];
