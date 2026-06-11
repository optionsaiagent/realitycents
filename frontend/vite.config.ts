import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss()];

export default defineConfig({
  plugins: plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          trpc: ['@trpc/client', '@trpc/react-query', '@tanstack/react-query'],
          ui: ['lucide-react', 'recharts'],
          pdf: ['html2pdf.js', 'pdf-lib'],
        },
      },
    },
  },
  server: {
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
