import { withPayload } from '@payloadcms/next/withPayload'
import FixImportMapPlugin from './scripts/webpack-fix-importmap-plugin.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Disable linting during build to avoid ESLint config issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily disable TypeScript errors during build to speed up deployment
  // Type checking should be done separately in CI/CD
  typescript: {
    ignoreBuildErrors: true,
  },
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Add plugin to fix import map paths automatically
    webpackConfig.plugins.push(new FixImportMapPlugin())

    return webpackConfig
  },
}

// Bundle server packages (like payload) into the standalone output so the
// payload CLI exists at .next/standalone/node_modules for migrations.
export default withPayload(nextConfig, { devBundleServerPackages: true })
