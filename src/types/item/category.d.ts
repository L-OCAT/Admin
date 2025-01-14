export interface Category {
  readonly id: number;
  readonly name: string;
  readonly parentId: number | null;
  readonly parentName: string | null;
}
