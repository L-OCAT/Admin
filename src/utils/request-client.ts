import { BaseResponse } from "@/types/common/response";
import { getProperty } from "@/utils/environment";

const API_URL = getProperty("API_URL");

export async function request<T>(
  url: string,
  options?: RequestInit
): Promise<BaseResponse<T>> {
  const accessToken = localStorage.getItem("accessToken");
  const headers = new Headers(options?.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const updatedOptions = {
    ...options,
    headers: headers,
  };

  const response = await fetch(`${API_URL}${url}`, updatedOptions);
  if (!response.ok) {
    throw new Error(response.status.toString());
  }
  return (await response.json()) as BaseResponse<T>;
}
