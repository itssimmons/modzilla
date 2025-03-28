interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
}

export const env = import.meta.env as unknown as ImportMetaEnv
