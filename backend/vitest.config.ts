import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./src/setup.ts'],
        globals: true,
        environment: 'node',
    },
});