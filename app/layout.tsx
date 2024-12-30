import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'UROBBYU\'s VTT SaaS App',
	description: 'Simple Voice-to-text app created with Next.js'
}

export default ({
	children
}: Readonly<{
	children: React.ReactNode
}>) =>
<ClerkProvider>
	<html lang='en'>
		<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
			{children}
		</body>
	</html>
</ClerkProvider>
