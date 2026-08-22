import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['SUPABASE_', 'JS_REPORT_', 'N8N_', 'EVO_'],
  server: {
    port: 3000,
    open: true,
  },
});
