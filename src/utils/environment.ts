import { IEnvironment } from "@/types/environment";

const VUE_ENV_PREFIX = "VUE_APP_";

export const getProperty = (key: keyof IEnvironment): string => {
  const value = process.env[VUE_ENV_PREFIX + key];
  if (!value) {
    throw new Error(`Environment property ${key} is not set`);
  }
  return value;
};
