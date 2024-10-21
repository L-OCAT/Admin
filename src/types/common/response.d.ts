export interface BaseResponse<T> {
  readonly message: string;
  readonly data: T;
}

export interface PageResponse<T> {
  readonly message: string;
  readonly data: {
    readonly content: T;
    readonly totalPages: number;
    readonly totalElements: number;
    readonly last: boolean;
    readonly size: number;
    readonly number: number;
    readonly sort: {
      readonly sorted: boolean;
      readonly unsorted: boolean;
      readonly empty: boolean;
    };
    readonly numberOfElements: number;
    readonly first: boolean;
    readonly empty: boolean;
  };
}

export interface ErrorResponse {
  readonly message: string;
  readonly data: {
    readonly message: string;
    readonly code: number;
  };
}
