/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ES_URL_1: process.env.ES_URL_1,
    ES_URL_2: process.env.ES_URL_2,
  },
}

module.exports = nextConfig 