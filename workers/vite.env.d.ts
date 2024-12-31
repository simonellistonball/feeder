/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Define your env variables here
  REDIS_URL: string;
  ATTACHMENT_PATH: string;
  AUTH_GOOGLE_ID: string;
  AUTH_GOOGLE_SECRET: string;
  // ... other env vars
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
