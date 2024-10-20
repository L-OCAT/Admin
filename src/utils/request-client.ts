import { BaseResponse } from "@/types/common/response";
import { getProperty } from "@/utils/environment";

const API_URL = getProperty("API_URL");

export async function request<T>(
  url: string,
  options?: RequestInit
): Promise<BaseResponse<T>> {
  const requestOptions = appendAuthorization(options);
  const response = await fetch(`${API_URL}${url}`, requestOptions);
  if (!response.ok) {
    throw new Error(response.status.toString());
  }
  return (await response.json()) as BaseResponse<T>;
}

export async function requestActuator<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const requestOptions = appendAuthorization(options);

  const response = await fetch(`${API_URL}${url}`, requestOptions);
  if (!response.ok) {
    throw new Error(response.status.toString());
  }
  return (await response.json()) as T;
}

const appendAuthorization = (options?: RequestInit): RequestInit => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = new Headers(options?.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return {
    ...options,
    headers: headers,
  };
};
