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
	const [inputLocked, setInputLocked] = useState(false)

	const fileRef = useRef<HTMLInputElement>(null)

	const [state, setState] = useState<State>({})

	// TODO: Check why `inputLocked` state doesn't update
	const checkAudio = async (formData: FormData) => {
		setInputLocked(true)

		const validatedFile = await parseAudioFile(formData.get('file'))

		const newState: State = validatedFile.success
			? await uploadAudio(formData)
			: {
				errors: validatedFile.error.flatten().formErrors,
				message: 'Invalid File.'
			}

		setForcedButton(false)
		setInputLocked(false)

		setState(newState)
	}

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

		if (!isAllowed || inputLocked) {
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

	const stateText = state.message ?? props.text

	return <form
		className='w-full h-screen-44'
		action={checkAudio}
		onDragOver={handleDragOver}
		onDragLeave={handleDragLeave}
		onDragEnd={handleDragEnd}
		onDrop={handleDrop}
	>
		<div className={clsx(
			'form-column flex flex-col-reverse w-full h-full tracking-wide',
			!stateText && 'justify-center'
		)}>
			<p
				className={clsx(
					'mt-3 text-center opacity-70 select-none',
					(inputLocked || file || props.filename) && 'hidden'
				)}
			>「 Or just drop it in this area 」</p>
			<div className={clsx(
				'input-box rounded-2xl',
				fileEnter && 'active',
				inputLocked && 'cursor-wait'
			)}>
				<label
					htmlFor='file'
					className={clsx(
						'block p-4 justify-center text-center cursor-pointer hover:brightness-90 active:brightness-75',
						inputLocked && 'pointer-events-none'
					)}
				>
					{inputLocked ? <><p>Loading</p><p className='text-sm opacity-85'>please wait...</p></> : file
						? <p className='text-lg'>Selected file: <span className='font-bold font-mono tracking-tight'>{file.name}</span></p>
						: <>
							<p className='text-lg'>{props.filename
								? <>Response for: <span className='font-bold font-mono tracking-tight'>{props.filename}</span></>
								: 'Choose a file to upload'
							}</p>
							<p className='mt-2 text-sm opacity-85'>
								(suppoted file types are: <code>mp3</code>, <code>mp4</code>, <code>mpeg</code>, <code>mpga</code>, <code>m4a</code>, <code>wav</code>, <code>webm</code>)
							</p>
						</>
					}
				</label>
				<input
					id='file'
					name='file'
					ref={fileRef}
					type='file'
					accept='.mp3'
					required
					className='hidden'
					onChange={handleChange}
				/>
				<button
					className={clsx(
						'w-full justify-center p-2 border-t-8 border-dark text-lg font-bold hover:brightness-90 active:brightness-75',
						((!file || state.message) && !forcedButton) && 'hidden',
						inputLocked && 'pointer-events-none'
					)}
				>
					Upload
				</button>
			</div>
			<div className={clsx(
				'pb-10 px-5 leading-relaxed first-letter:capitalize overflow-y-scroll',
				!stateText && 'hidden',
				state.errors && 'text-red-500'
			)}>
				{stateText}
				<div className={clsx(
					!state.errors && 'hidden'
				)}>
					{state.errors?.map((error: string) =>
						<p className='mt-2 text-sm text-red-500' key={error}>
							{error}
						</p>)
					}
				</div>
			</div>
		</div>
	</form>
}