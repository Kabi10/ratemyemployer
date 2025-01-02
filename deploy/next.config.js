const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['stvmsmqnrwiifwthlppy.supabase.co', 'your-image-domain.com', 'ui-avatars.com', 'logo.clearbit.com'],
  },
  output: 'standalone',
  poweredByHeader: false,
}

module.exports = withBundleAnalyzer(nextConfig) 