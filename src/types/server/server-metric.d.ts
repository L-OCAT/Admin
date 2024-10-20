export interface IHealth {
  status: "UP" | "DOWN" | "UNKNOWN" | "OUT_OF_SERVICE";
  components: {
    db: IDbHealth;
    redis: IRedisHealth;
  };
}

export interface IHealthDetails {
  [key: string]: unknown;
}

export interface IComponentHealth {
  details?: IHealthDetails;
}

export interface IServerHealth extends IComponentHealth {
  details: {
    diskSpace: {
      total: number;
      free: number;
      threshold: number;
      path: string;
      exists: boolean;
    };
  };
}

export interface IDbHealth extends IComponentHealth {
  details: {
    database: string;
    validationQuery: string;
  };
}

export interface IRedisHealth extends IComponentHealth {
  details: {
    version: string;
  };
}
