import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: '26MB'
		}
	}
}

export default nextConfig
