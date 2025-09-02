/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['storage.googleapis.com', 'oss.aliyuncs.com'],
  },
  async redirects() {
    return [
      // Redirect root to default locale
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Force HTTPS canonical for all pages
          {
            key: 'Link',
            value: '<https://covergen.pro/:path*>; rel="canonical"',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig