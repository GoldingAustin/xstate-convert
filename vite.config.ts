// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

const entry = resolve(__dirname, 'src', 'index.ts');
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: entry,
      name: 'XStateConvert',
      fileName: 'xstate-convert',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['xstate', 'react', 'react-dom', 'camelcase'],
    },
  },
});
