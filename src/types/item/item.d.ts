export type ItemStatus = "lost" | "found";
export interface Item {
  readonly id: number;
  readonly name: string;
  readonly categoryPath: number;
  readonly location: string;
  readonly date: string;
  readonly status: ItemStatus;
  readonly description: string;
}
