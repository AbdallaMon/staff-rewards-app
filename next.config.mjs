/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'files.emsatstaff.ae',
                pathname: '/**',
            },
        ],
    },
}

export default nextConfig;
