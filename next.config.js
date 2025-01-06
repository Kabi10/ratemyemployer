import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['stvmsmqnrwiifwthlppy.supabase.co', 'your-image-domain.com', 'ui-avatars.com', 'logo.clearbit.com'],
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Disable webpack caching completely
    config.cache = false
    
    // Handle punycode deprecation
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
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

export default withBundleAnalyzer(nextConfig) 