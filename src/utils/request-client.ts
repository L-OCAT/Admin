import { getProperty } from "@/utils/environment";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const PUBLIC_API_KEY = getProperty("API_PUBLIC_KEY");

const API_URL = getProperty("API_URL");

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export async function request<T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const cleanedOptions = {
    ...options,
    params: options?.params ? cleanEmptyQueryParams(options.params) : undefined,
  };
  const response: AxiosResponse<T> = await axiosInstance(url, cleanedOptions);
  return response.data;
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers["Locat-Api-Key"] = PUBLIC_API_KEY;
  return config;
});

const cleanEmptyQueryParams = (obj: Record<string, unknown>) => {
  return Object.entries(obj)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
