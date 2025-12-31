import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "dist/spa",
  },
  server: {
    host: "::",
    port: 8081,
    fs: {
      allow: ["./", "./client", "./shared", "./public", "./fonts"],
      deny: ["server/**"],
    },
  },
});
