import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom")) return "react-dom";
            if (id.includes("react/") || id.includes("react\\")) return "react";
            if (id.includes("lucide-react")) return "lucide-react";
            if (id.includes("recharts")) return "recharts";
            if (id.includes("@radix-ui")) return "radix-ui";
            if (id.includes("react-router")) return "react-router";
            if (id.includes("date-fns")) return "date-fns";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
