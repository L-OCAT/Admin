import { AdminUserDetails } from "@/types/admin/user-details";
import { jwtDecode } from "jwt-decode";

export const parseJwt = (token: string): AdminUserDetails => {
  return jwtDecode<AdminUserDetails>(token);
};

export const isTokenValid = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return false;
  }
  return !!parseJwt(accessToken);
};

export const invalidateToken = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
