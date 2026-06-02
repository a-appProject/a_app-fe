interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AUTH_DATE: string
  readonly VITE_USER_HASH: string
  readonly VITE_FIRST_NAME: string
  readonly VITE_USER_ID: string 
  readonly VITE_PHOTO_URL: string
  readonly VITE_USER_NAME: string
  readonly VITE_DEV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}