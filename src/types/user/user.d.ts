export interface EndUser {
  readonly id: number;
  nickname: string;
  email: string;
  readonly oAuthType: string;
  readonly type: string;
  readonly statusType: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

export interface AdminUser {
  readonly id: number;
  nickname: string;
  email: string;
  readonly deviceId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status: string;
}
