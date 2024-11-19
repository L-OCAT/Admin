export interface IEnvironment {
  readonly APP_TITLE: string;
  readonly APP_VERSION: string;
  readonly APP_BUILD_DATE: string;
  readonly BASE_URL: string;
  readonly API_URL: string;
  readonly API_PUBLIC_KEY: string;
  readonly KAKAO_KEY: string;
  readonly KAKAO_REDIRECT_URI: string;
  readonly APPLE_CLIENT_ID: string;
  readonly APPLE_REDIRECT_URI: string;
}

export type ImportMetaEnv = IEnvironment;

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
