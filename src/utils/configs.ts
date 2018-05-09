export interface ILoggerConfig {
    level: string;
}

export interface IJWTConfig {
    secret: string;
}

export interface IGoogleConfig {
    bigQuery: {
        projectId: string,
        dataSet: string
    };
}

export interface IServerConfig {
    port: number;
}
