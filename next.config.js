/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@azure/msal-browser']
}

module.exports = nextConfig
