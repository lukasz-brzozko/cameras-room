declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      HOST: string;
      PORT_SERVER: string;
      PORT_PEER: string;
      SESSION_SECRET: string;
      PASSWORD: string;
    }
  }
}

export {};
