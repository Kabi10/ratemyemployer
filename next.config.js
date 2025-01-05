const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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
  compress: true
}

module.exports = withBundleAnalyzer(nextConfig) 