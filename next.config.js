/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/mcp/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
}

module.exports = nextConfig