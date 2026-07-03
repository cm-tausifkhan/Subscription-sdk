import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // ADD THIS SECTION TO FIX THE INVALID HOOK CALL
    dedupe: ["react", "react-dom"], 
  },
})