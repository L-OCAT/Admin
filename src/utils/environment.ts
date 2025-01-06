import { IEnvironment } from "@/types/common/environment";

const VUE_ENV_PREFIX = "VITE_";

export const getProperty = (key: keyof IEnvironment): string => {
  const value = import.meta.env[`${VUE_ENV_PREFIX}${key}`];
  if (!value) {
    throw new Error(`Environment property ${key} is not set`);
  }
  return value;
};
