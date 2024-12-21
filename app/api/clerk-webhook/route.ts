import prisma from '@lib/prisma'
import crypto from 'crypto'
import { env } from 'process'

interface ExtRequest extends Request {
	rawBody: string
}

interface ClerkUserCreated {
	data: {
		created_at: number,
		email_addresses: {
			email_address: string,
			id: string
		}[],
		first_name: string,
		id: string,
		image_url: string,
		last_name: string
		primary_email_address_id: string,
		username: string | null
	},
	type: 'user.created'
}

interface ClerkUserUpdated extends Omit<ClerkUserCreated, 'type'> {
	type: 'user.updated'
}

interface ClerkUserDeleted {
	data: { id: string },
	type: 'user.deleted'
}

type ClerkWebhookBody = ClerkUserCreated | ClerkUserUpdated | ClerkUserDeleted

const secret = env['CLERK_SIGNING_SECRET']
const secretBytes = Buffer.from(secret?.split('_')[1] ?? '', 'base64')

const verifySignature = (req: ExtRequest) => {
	const svixId = req.headers.get('svix-id')
	const svixTimestamp = req.headers.get('svix-timestamp')
	const svixSignature = req.headers.get('svix-signature')?.substring(3)
	const signedContent = `${svixId}.${svixTimestamp}.${req.rawBody}`
	const signature = crypto
		.createHmac('sha256', secretBytes)
		.update(signedContent)
		.digest('base64')

	return signature === svixSignature
}

const getEmail = (data: (ClerkUserCreated | ClerkUserUpdated)['data']) =>
	data.email_addresses.find(email => email.id === data.primary_email_address_id) ??
	data.email_addresses[0]

export const POST = async (req: ExtRequest) => {
	req.rawBody = await req.text()

	const isVerified = verifySignature(req)
	if (!isVerified) return new Response('Svix signature cannot be verified', { status: 412 })

	const body = JSON.parse(req.rawBody) as ClerkWebhookBody

	try {
		const clerkId = body.data.id
		const where = { clerkId }

		if (body.type === 'user.deleted')
			await prisma.user.delete({ where })
		else {
			const email = getEmail(body.data).email_address

			if (body.type === 'user.created')
				await prisma.user.create({ data: { clerkId, email }})
			else
				await prisma.user.update({ where, data: { email } })
		}
	} catch (error) {
		console.error(error)
		return new Response('Webhook Error.', { status: 500 })
	}

	return new Response()
}