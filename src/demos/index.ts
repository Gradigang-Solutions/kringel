import { acidLine } from "@/demos/acidLine";
import { dustyKeys } from "@/demos/dustyKeys";
import { slowTide } from "@/demos/slowTide";
import { warehouse } from "@/demos/warehouse";
import type { Project } from "@/model/types";

export interface Demo {
  readonly project: Project;
  readonly genre: string;
}

export const DEMOS: readonly Demo[] = [
  { project: warehouse, genre: "Peak-time techno" },
  { project: dustyKeys, genre: "Lo-fi hip-hop" },
  { project: acidLine, genre: "Acid techno" },
  { project: slowTide, genre: "Ambient" },
];
