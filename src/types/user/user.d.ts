export interface EndUser {
  readonly id: number;
  nickname: string;
  email: string;
  oAuthType: string;
  readonly createdAt: string;
  updatedAt: string;
  status: string;
}

export interface AdminUser {
  readonly id: number;
  nickname: string;
  email: string;
  deviceId: string;
  readonly createdAt: string;
  updatedAt: string;
  status: string;
}
