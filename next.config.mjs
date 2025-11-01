import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Disable linting during build to avoid ESLint config issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (type checking is separate)
  typescript: {
    ignoreBuildErrors: false, // Keep type checking, just disable ESLint
  },
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

// Bundle server packages (like payload) into the standalone output so the
// payload CLI exists at .next/standalone/node_modules for migrations.
export default withPayload(nextConfig, { devBundleServerPackages: true })
