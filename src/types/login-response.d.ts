export interface LoginResponse {
  needMfa: boolean;
  isPasswordExpired: boolean;
  token: TokenDto;
}

export interface TokenDto {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}
