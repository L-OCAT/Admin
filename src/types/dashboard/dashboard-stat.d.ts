export interface Dashboardstat {
  totalUsers: number;
  totalLostItems: number;
  totalFoundItems: number;
}

export interface ItemRegistrationStat {
  lost: number;
  found: number;
}

export interface MonthlyItemStat {
  monthLabels: string[];
  lostItemCount: number[];
  foundItemCount: number[];
}

export interface ItemStatByCateogory {
  categoryLabels: string[];
  lostItemCount: number[];
  foundItemCount: number[];
}
