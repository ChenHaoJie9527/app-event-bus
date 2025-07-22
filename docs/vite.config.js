import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/small-event-system/', // Configuring the base path for GitHub Pages
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
