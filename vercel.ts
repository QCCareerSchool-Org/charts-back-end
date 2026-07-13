import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  version: 2,
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
};
