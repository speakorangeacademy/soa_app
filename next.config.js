const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
        {
            urlPattern: /^https?.*\.(js|css|png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-assets',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 30
                }
            }
        },
        {
            urlPattern: /^https?.*/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'html-cache'
            }
        },
        {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly'
        }
    ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true
}

module.exports = withPWA(nextConfig)
