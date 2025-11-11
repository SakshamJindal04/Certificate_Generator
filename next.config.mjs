/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to use your HTML files as the main pages
  async rewrites() {
    return [
      {
        source: '/', // The homepage URL
        destination: '/index.html', // The file to show
      },
      {
        source: '/create', // The /create URL
        destination: '/create.html', // The file to show
      },
      {
        source: '/about', // The /about URL
        destination: '/about.html', // The file to show
      },
    ];
  },
};

export default nextConfig;