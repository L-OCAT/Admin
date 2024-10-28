export type ItemStatus = "lost" | "found";
export interface Item {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly location: string;
  readonly date: string;
  readonly status: ItemStatus;
  readonly description: string;
}
