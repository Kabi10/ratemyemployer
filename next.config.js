import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'stvmsmqnrwiifwthlppy.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      }
    ],
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Enable webpack caching for faster builds
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        punycode: false
      }
    }
    return config
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  typescript: {
    // Temporarily disable type checking for build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint for build
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
}

export default withBundleAnalyzer(nextConfig) 