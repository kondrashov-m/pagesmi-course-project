
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true, // Allow SVG globally for next/image
  },
  // async redirects() {  // Комментируем или удаляем этот блок
  //   return [
  //     {
  //       source: '/',
  //       destination: '/login1',
  //       permanent: false,
  //     },
  //   ]
  // },
};

export default nextConfig;
