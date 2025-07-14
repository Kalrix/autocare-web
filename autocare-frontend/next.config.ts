/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'admin.autocare24.co.in' }],
        destination: '/admin/login',
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'garage.autocare24.co.in' }],
        destination: '/garage/login',
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'store.autocare24.co.in' }],
        destination: '/store/login',
      },
    ];
  },
};

export default nextConfig;
