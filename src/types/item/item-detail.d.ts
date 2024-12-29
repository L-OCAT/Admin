export type ItemType = "lost" | "found";
export interface ItemDetail {
  readonly id: number;
  readonly itemId: number;
  readonly username: string;
  readonly itemType: ItemType;
  readonly itemName: string;
  readonly imageUrl: string | null;
  readonly status: string;
  readonly colorNames: string[];
  readonly lat: number;
  readonly lng: number;
  readonly region1: string;
  readonly region2: string;
  readonly region3: string;
  readonly roadAddress?: string;
  readonly buildingName?: string;
  readonly categoryPath: string;
  readonly createdAt: string;
}
