import { getProperty } from "@/utils/environment";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const API_URL = getProperty("API_URL");

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export async function request<T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<T> = await axiosInstance(url, options);
  return response.data;
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
