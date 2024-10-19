export interface BaseResponse<T> {
  readonly message: string;
  readonly data: T;
}
