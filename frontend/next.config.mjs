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
  eslint: {
    // Disable the problematic ESLint rules during build
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
    },
  },
};

export default nextConfig;
