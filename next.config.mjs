/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/bigquery', '@google-cloud/tasks'],
  },
};

export default nextConfig;
