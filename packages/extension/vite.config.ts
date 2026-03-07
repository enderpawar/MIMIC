import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

const copyManifest = {
  name: 'copy-manifest',
  closeBundle() {
    copyFileSync(
      resolve(__dirname, 'manifest.json'),
      resolve(__dirname, 'dist/manifest.json')
    );
  },
};

export default defineConfig({
  root: resolve(__dirname, 'src'),
  envDir: resolve(__dirname, '../..'),
  plugins: [react(), copyManifest],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/capture': resolve(__dirname, 'src/content/capture.ts'),
        'popup/index': resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
