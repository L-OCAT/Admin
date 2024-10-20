export interface LoginResponse {
  needMfa: boolean;
  isPasswordExpired: boolean;
  readonly token: TokenDto;
}

export interface TokenDto {
  readonly grantType: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresIn: number;
  readonly refreshTokenExpiresIn: number;
}
