/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'fastly.picsum.photos'],
    formats: ['image/avif', 'image/webp'],
  }
}

module.exports = nextConfig
