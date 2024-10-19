export interface AdminUserDetails {
  readonly sub: string;
  readonly name: string;
  readonly auth: Authority[];
}

export interface Authority {
  readonly authority: string;
}
