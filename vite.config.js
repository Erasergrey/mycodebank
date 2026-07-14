import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/mycodebank/' : '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/**/*.js',
        'src/components/auth/LoginForm.jsx',
        'src/components/transfer/TransferForm.jsx',
        'src/components/transactions/TransactionHistory.jsx',
      ],
      exclude: [
        'src/**/*.test.js',
        'src/**/*.test.jsx',
        'src/test/**',
        'src/services/firebase.js',
        'src/main.jsx',
      ],
    },
  },
})
