import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/subdirectory/',
  build: {
    chunkSizeWarningLimit: 1000, // Set the limit to 1000 kB (1 MB) or a value that suits your needs
  },
});
