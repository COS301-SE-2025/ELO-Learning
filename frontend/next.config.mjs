/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ifbpkwlfrsgstdapteqh.supabase.co',
        pathname: '/storage/v1/object/public/profile-pics/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  devIndicators: false,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Add trailing slash for better compatibility
  trailingSlash: false,
  // Optimize for production
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
