import type { IdGenerator } from "@/model/types";

export const nextId: IdGenerator = () => crypto.randomUUID();
