'use server'

import OpenAI from 'openai'
import prisma from '@lib/prisma'
import { parseAudioFile } from '@util'
import { currentUser } from '@clerk/nextjs/server'
import crypto from 'crypto'

export type State = {
	errors?: string[]
	message?: string
}

const openai = new OpenAI()

export const uploadAudio = async (prevState: State | undefined, formData: FormData): Promise<State> => {
	const user = await currentUser()

	if (!user) return {
		errors: ['Not Authorized.'],
		message: 'Internal Server Error.'
	}

	const validatedFile = parseAudioFile(formData.get('file'))

	if (!validatedFile.success) return {
		errors: validatedFile.error.flatten().formErrors,
		message: 'Upload Failed.'
	}

	const file = validatedFile.data
	console.log(file)

	const hash = crypto
		.createHash('sha256')
		.update(await file.bytes())
		.digest('hex')

	try {
		const upload = await prisma.upload.findFirst({ where: { hash } })

		const message = upload ? upload.text : await openai.audio.transcriptions.create({
			file,
			model: 'whisper-1',
			response_format: 'text'
		})

		try {
			await prisma.upload.create({ data: {
				filename: file.name,
				text: message,
				size: file.size,
				author: { connect: { clerkId: user.id } },
				hash
			} })
		} catch (error) {
			return {
				errors: [`${error}`],
				message: 'DB update failed.'
			}
		}

		return { message }
	} catch (error) {
		return {
			errors: [`${error}`],
			message: 'DB search failed.'
		}
	}
}