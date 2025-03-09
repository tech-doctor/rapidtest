// env.d.ts
interface ImportMetaEnv {
    VITE_PUBLIC_BASE_URL: string;
    // Add other environment variables here
}

interface ImportMeta {
    env: ImportMetaEnv;
}