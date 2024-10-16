import { AdminUserDetails } from "@/types/user-details";
import { jwtDecode } from "jwt-decode";

export const parseJwt = (token: string): AdminUserDetails => {
  return jwtDecode<AdminUserDetails>(token);
};

export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return false;
  }
  return !!parseJwt(accessToken);
};
