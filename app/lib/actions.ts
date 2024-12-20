'use server'

import { z } from 'zod'
import OpenAI from 'openai'
import { getDataSizeUnit } from '@util'
import prisma from '@lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import crypto from 'crypto'

export type State = {
	errors?: string[]
	message?: string
}

const ALLOWED_AUDIO_SIZE = 1e6
const audioSizeUnit = getDataSizeUnit(ALLOWED_AUDIO_SIZE)
const ALLOWED_AUDIO_SIZE_TEXT =
	`${Math.round(ALLOWED_AUDIO_SIZE / 1e3 ** audioSizeUnit[1] * 1e2) / 1e2} ${audioSizeUnit[0]}`

const ALLOWED_AUDIO_EXTENSIONS = [
	'mp3'
]

const openai = new OpenAI()

const checkFileSize = (file: File) => file.size <= ALLOWED_AUDIO_SIZE

const checkFileType = (file: File) =>
	ALLOWED_AUDIO_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() ?? '')

const AudioFileScheme = z.instanceof(File)
	.refine(checkFileSize, `File size exceeds ${ALLOWED_AUDIO_SIZE_TEXT}.`)
	.refine(checkFileType, 'Incorrect file type.')

export const uploadAudio = async (prevState: State | undefined, formData: FormData): Promise<State> => {
	const user = await currentUser()

	if (!user) return {
		errors: ['Not Authorized.'],
		message: 'Internal Server Error.'
	}

	const validatedFile = AudioFileScheme.safeParse(formData.get('file'))

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