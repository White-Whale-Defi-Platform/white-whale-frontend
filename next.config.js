
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})



/**
 * @0xFable - Suppress errant recoil errors which seem to occur due to hot reloading
 * When using the app there is constant recoil warnings in the logs that users could see which indicate
 * almost fatal issues with the state.
 * Rather than this meaning an issue, on multiple SSR based frameworks there is an issue noted with seeing this on refreshes
 * possible because the state/pages are being loaded with hot module replacement
 * For more info go here: https://github.com/facebookexperimental/Recoil/issues/733
 */
const intercept = require('intercept-stdout')

// safely ignore recoil stdout warning messages
function interceptStdout(text) {
  if (text.includes('Duplicate atom key')) {
    return ''
  }
  return text
}

// Intercept in dev and prod
intercept(interceptStdout)

const config = {
  async redirects() {
    const redirects = [
      {
        source: '/',
        destination: '/migaloo/swap',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/migaloo/dashboard',
        permanent: false,
      },
      {
        source: '/pools',
        destination: '/migaloo/pools',
        permanent: false,
      },
      {
        source: '/vaults',
        destination: '/migaloo/vaults',
        permanent: false,
      },
      {
        source: '/flashloan',
        destination: '/migaloo/flashloan',
        permanent: false,
      },
    ]
    return redirects
  },
  // Adding policies:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          }
        ],
      },
    ];
  },
  reactStrictMode: false,
  // TODO: Needed to disabled all build error checking and eslint checking due to error with usage of Controller component, to fix that needs to be fixed
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  output: "standalone",
  experimental: {
    webpackBuildWorker: true
},
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/dk8s7xjsl/image/upload/',
  },
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    )

    if (!config.resolve.fallback) {
      config.resolve.fallback = {}
    }

    Object.assign(config.resolve.fallback, {
      buffer: false,
      crypto: false,
      events: false,
      path: false,
      stream: false,
      string_decoder: false,
    })

    return config
  },
}

module.exports = withBundleAnalyzer(config)
