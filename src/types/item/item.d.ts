export type ItemStatus = "lost" | "found";
export interface Item {
  readonly id: number;
  readonly itemId: number;
  readonly name: string;
  readonly categoryPath: number;
  readonly location: string;
  readonly region1: string;
  readonly region2: string;
  readonly region3: string;
  readonly createdAt: string;
  readonly type: ItemStatus;
  readonly description: string;
}
