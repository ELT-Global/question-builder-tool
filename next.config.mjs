// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export', // 👈 generates static files
//   images: { unoptimized: true }, // optional: disables Next.js Image Optimization
//   basePath: '/question-builder-tool', // 👈 replace with your repo name
//   assetPrefix: '/question-builder-tool/', // 👈 same here
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: '/question-builder-tool', 
  assetPrefix: '/question-builder-tool/',
}

export default nextConfig
