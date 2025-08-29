import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.remotrack.pl',
          },
        ],
        destination: 'https://remotrack.pl/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
