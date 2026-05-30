import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Impede o Vite de tentar ler os binários que o Rust está compilando
      ignored: ['**/src-tauri/**'] 
    }
  }
});