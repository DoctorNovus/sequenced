import { nanoid } from "nanoid";

/* Creates an id with set length */
export function createID(length: number): string {
  return nanoid(length);
}