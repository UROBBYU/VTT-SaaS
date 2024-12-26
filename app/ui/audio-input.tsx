'use client'

import { ALLOWED_AUDIO_EXTENSIONS, parseAudioFile } from '@util'
import { State, uploadAudio } from '@lib/actions'
import clsx from 'clsx'
import { ChangeEventHandler, DragEventHandler, useActionState, useRef, useState } from 'react'

export default (props: {
	text?: string
	filename?: string
}) => {
	const [file, setFile] = useState<File>()
	const [fileEnter, setFileEnter] = useState(false)
	const [forcedButton, setForcedButton] = useState(false)

	const fileRef = useRef<HTMLInputElement>(null)

	const checkAudio = (prevState: State | undefined, formData: FormData) => {
		const validatedFile = parseAudioFile(formData.get('file'))

		if (!validatedFile.success) return {
			errors: validatedFile.error.flatten().formErrors,
			message: 'Upload Failed.'
		}

		setForcedButton(false)

		return uploadAudio(prevState, formData)
	}

	const initialState: State = {}
	const [state, formAction] = useActionState(checkAudio, initialState)

	const handleDragOver: DragEventHandler<HTMLFormElement> = e => {
		const item = e.dataTransfer.items[0]
		const isAllowed = e.dataTransfer.items.length === 1 &&
			item.kind === 'file' && [
				'audio/mpeg',
				'audio/mp4',
				'audio/wav',
				'audio/vnd.wav',
				'audio/webm',
				'video/mpeg',
				'video/mp4',
				'video/webm'
			].includes(item.type)

		if (!isAllowed) {
			e.dataTransfer.effectAllowed = 'none'
			return
		}

		e.preventDefault()
		setFileEnter(true)
	}
	const handleDragLeave: DragEventHandler<HTMLFormElement> = e => {
		setFileEnter(false)
	}
	const handleDragEnd: DragEventHandler<HTMLFormElement> = e => {
		e.preventDefault()
		setFileEnter(false)
	}
	const handleDrop: DragEventHandler<HTMLFormElement> = e => {
		e.preventDefault()
		setFileEnter(false)

		const file = e.dataTransfer.files[0]
		const fileExtension = file.name.split('.').pop() ?? ''
		console.log('File:', file)

		if (!ALLOWED_AUDIO_EXTENSIONS.includes(fileExtension))
			return console.error('Unsupported file extension:', fileExtension)

		setFile(file)
		setForcedButton(true)
		const container = new DataTransfer()
		container.items.add(file)
		fileRef.current!.files = container.files
	}

	const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
		const file = e.target.files?.[0]
		console.log(file)

		if (file) {
			setFile(file)
			setForcedButton(true)
		}
	}

	return <form
		className="w-full h-screen"
		action={formAction}
		onDragOver={handleDragOver}
		onDragLeave={handleDragLeave}
		onDragEnd={handleDragEnd}
		onDrop={handleDrop}
	>
		<div className='form-column flex flex-col justify-end w-full h-full tracking-wide'>
			<div className={clsx(
				'pb-10 pl-5 leading-relaxed',
				!(state.message ?? props.text) && 'hidden',
				state.errors && 'text-red-500'
			)}>
				{state.message ?? props.text}
				<div className={clsx(
					!state.errors && 'hidden'
				)}>
					{state.errors?.map((error: string) =>
						<p className="mt-2 text-sm text-red-500" key={error}>
							{error}
						</p>)
					}
				</div>
			</div>
			<div className={clsx(
				'input-box rounded-2xl',
				fileEnter && 'active'
			)}>
				<label htmlFor="file" className="block p-4 justify-center text-center cursor-pointer">
					{file
						? <p className='text-lg'>Selected file: {file.name}</p>
						: <>
							<p className='text-lg'>{props.filename
								? `Response for: ${props.filename}`
								: 'Choose a file to upload'
							}</p>
							<p className='text-sm text-gray-300'>
								(Suppoted file types are: <code>mp3</code>, <code>mp4</code>, <code>mpeg</code>, <code>mpga</code>, <code>m4a</code>, <code>wav</code>, <code>webm</code>)
							</p>
						</>
					}
				</label>
				<input
					id="file"
					name="file"
					ref={fileRef}
					type="file"
					accept=".mp3"
					required
					className="hidden"
					onChange={handleChange}
				/>
				<button
					className={clsx(
						'w-full justify-center p-2 border-t-4 border-dark text-lg',
						((!file || state.message) && !forcedButton) && 'hidden'
					)}
				>
					Upload
				</button>
			</div>
		</div>
	</form>
}