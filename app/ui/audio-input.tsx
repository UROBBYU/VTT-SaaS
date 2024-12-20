'use client'

import { State, uploadAudio } from '@lib/actions'
import clsx from 'clsx'
import { ChangeEventHandler, DragEventHandler, useActionState, useEffect, useRef, useState } from 'react'

export default () => {
	const [file, setFile] = useState<File>()
	const [fileEnter, setFileEnter] = useState(false)
	const [forcedButton, setForcedButton] = useState(false)

	const fileRef = useRef<HTMLInputElement>(null)

	const initialState: State = {}
	const [state, formAction] = useActionState(uploadAudio, initialState)

	const handleForm = (payload: FormData) => {
		setForcedButton(false)
		formAction(payload)
	}

	const handleDragOver: DragEventHandler<HTMLFormElement> = e => {
		const item = e.dataTransfer.items[0]
		const isAudio = e.dataTransfer.items.length === 1 &&
			item.kind === 'file' &&
			item.type === 'audio/mpeg'

		if (!isAudio) {
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

		if (!['mp3'].includes(fileExtension))
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
		action={handleForm}
		className={clsx(
			"flex flex-col w-full border-y border-gray-300 rounded-md",
			fileEnter && "bg-blue-300 border-blue-400"
		)}
		onDragOver={handleDragOver}
		onDragLeave={handleDragLeave}
		onDragEnd={handleDragEnd}
		onDrop={handleDrop}
	>
		<div className={clsx(
			'p-2 border-b',
			!state.message && 'hidden',
			state.errors && 'text-red-500'
		)}>
			{state.message}
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
		<button
			className={clsx(
				'justify-center p-2 border-b',
				((!file || state.message) && !forcedButton) && 'hidden'
			)}
		>
			Upload
		</button>
		<label htmlFor="file" className="block p-4 justify-center text-center cursor-pointer">
			{file ? `Selected file: ${file.name}` : 'Choose a file to upload'}
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
	</form>
}