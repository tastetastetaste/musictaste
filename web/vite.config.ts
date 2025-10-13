import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          'beautiful-dnd': ['react-beautiful-dnd'],
          virtuoso: ['react-virtuoso'],
          query: ['@tanstack/react-query'],
          icons: ['@tabler/icons-react'],
        },
      },
    },
  },
  server: {
    port: 4200,
  },
});
