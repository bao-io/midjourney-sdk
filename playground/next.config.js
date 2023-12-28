/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })
    return config
  },
  experimental: {
    esmExternals: 'loose'
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/inpaint/:path*',
          destination:
            'https://936929561302675456.discordsays.com/inpaint/:path*'
        }
      ]
    }
  }
}

module.exports = nextConfig
