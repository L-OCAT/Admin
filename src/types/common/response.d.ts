export interface BaseResponse<T> {
  readonly message: string;
  readonly data: T;
}

export interface ErrorResponse {
  readonly message: string;
  readonly data: {
    readonly message: string;
    readonly code: number;
  };
}
