export interface AdminUserDetails {
  readonly id: string;
  readonly auth: Authority[];
}

export interface Authority {
  readonly authority: string;
}
