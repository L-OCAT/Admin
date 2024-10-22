export interface UserStatResponse {
  readonly id: number;
  readonly nickname: string;
  readonly email: string;
  readonly oAuthType: string;
  readonly type: string;
  readonly statusType: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string;
  readonly agreementDetails: AgreementDetail[];
  readonly activityDetails: ActivityDetail;
}

export interface AdminUserFoundItemStatResponse {
  readonly id: number;
  readonly name: string;
  readonly imageUrl: string;
  readonly categoryName: string;
  readonly status: string;
  readonly createdAt: string;
}

export interface AdminUserLostItemStatResponse {
  readonly id: number;
  readonly name: string;
  readonly imageUrl: string;
  readonly categoryName: string;
  readonly status: string;
  readonly createdAt: string;
}

interface AgreementDetail {
  readonly termsName: string;
  readonly isAgreed: boolean;
  readonly agreedAt: string;
}

interface ActivityDetail {
  readonly totalRegisteredLostItems: number;
  readonly totalRegisteredFoundItems: number;
}
