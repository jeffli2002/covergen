/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['storage.googleapis.com', 'oss.aliyuncs.com'],
  },
  i18n: {
    locales: ['en', 'zh', 'ja', 'ko'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig