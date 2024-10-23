const COLOR_MAP = {
  oauth: {
    KAKAO: "yellow darken-2",
    APPLE: "black",
    default: "grey",
  },
  userType: {
    ADMIN: "deep-purple darken-1",
    USER: "blue darken-1",
    default: "grey",
  },
  serverStatus: {
    UP: "green",
    DOWN: "red",
    OUT_OF_SERVICE: "orange",
    UNKNOWN: "grey",
    default: "grey",
  },
  status: {
    ACTIVE: "success darken-1",
    INACTIVE: "warning darken-1",
    BANNED: "error darken-1",
    default: "grey",
  },
};

export const getColorByType = (
  type: string,
  category: keyof typeof COLOR_MAP
): string => {
  const colorMap = COLOR_MAP[category];
  return colorMap[type as keyof typeof colorMap] || colorMap.default;
};

/* Helper functions */
export const getOAuthTypeColor = (type: string): string =>
  getColorByType(type, "oauth");

export const getUserTypeColor = (type: string): string =>
  getColorByType(type, "userType");

export const getServerStatusColor = (status: string): string =>
  getColorByType(status, "serverStatus");

export const getStatusTypeColor = (type: string): string =>
  getColorByType(type, "status");
