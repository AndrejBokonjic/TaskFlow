import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  define: {
    'process.env.NODE_ENV': '"production"',  // ← dodaj ovo
  },
  server: { port: 3002, cors: true },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.jsx'),
      name: 'MfAuth',
      fileName: 'mf-auth',
      formats: ['es'],
    },
  },
  preview: {
    port: 3002,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});