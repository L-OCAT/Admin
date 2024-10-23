interface ColorMap {
  [key: string]: string;
}

const COLOR_MAP: ColorMap = {
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
  status: {
    ACTIVE: "success darken-1",
    INACTIVE: "warning darken-1",
    BANNED: "error darken-1",
    default: "grey",
  },
};

export const getColorByType = (
  type: string,
  category: keyof typeof COLOR_MAPS
): string => {
  const colorMap = COLOR_MAPS[category];
  return colorMap[type as keyof typeof colorMap] || colorMap.default;
};

// 사용 편의를 위한 래퍼 함수들
export const getOAuthTypeColor = (type: string): string =>
  getColorByType(type, "oauth");
export const getUserTypeColor = (type: string): string =>
  getColorByType(type, "userType");
export const getStatusTypeColor = (type: string): string =>
  getColorByType(type, "status");
