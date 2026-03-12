import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Read .env from workspace root (Project_MIMIC/.env)
  envDir: '../..',
  server: {
    port: 5173,
  },
});
