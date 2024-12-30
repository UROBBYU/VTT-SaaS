'use client'

import { UserButton } from '@clerk/nextjs'
import AudioInput from '@ui/audio-input'
import Sidebar from '@ui/sidebar'
import Theme from '@ui/theme'
import { useState, useEffect } from 'react'
import { dark } from '@clerk/themes'
import type { Upload } from '@prisma/client'

const COLORS = [
	'#f3efe0',
	'#d19f9c',
	'#de8774',
	'#c27568',
	'#7FB7BE',
	'#F76589',
	'#F36'
]

export default ({
	upId,
	uploads
}: {
	upId?: string
	uploads: Upload[]
}) => {
	const [color, setColor] = useState(0)

	useEffect(() => {
		setColor(+(localStorage?.getItem('color') || 0) % COLORS.length)
	}, [])

	let selectedUpload: {
		filename: string
		text: string
	} | undefined

	if (upId) selectedUpload = uploads.find(up => up.id === upId)

	const updateColor = (c: number) => {
		localStorage.setItem('color', c.toString())
		setColor(c)
	}

	const Arrow = ({
		text,
		color
	}: {
		text: string
		color: number
	}) => <button
		onPointerDown={() => updateColor(color)}
		className='px-1 lh-28 inline-block bg-dark border-none select-none hover:opacity-80 active:opacity-60'
	>{text}</button>

	const colorName = COLORS[color]

	return <div className='flex'>
		<Theme color={colorName}/>
		<div className='w-100 bg-dark'>
			<Sidebar uploads={uploads}/>
		</div>
		<div className='w-full'>
			<div className='grid gc-3 justify-items-end p-2 w-full'>
				<div></div>
				<div className='justify-self-center rounded-md overflow-hidden'>
					<Arrow text='❮' color={color ? color - 1 : COLORS.length - 1}/>
					<span className='mx-1 px-3 lh-28 inline-block bg-dark'>{colorName}</span>
					<Arrow text='❯' color={(color + 1) % COLORS.length}/>
				</div>
				<UserButton showName appearance={{ baseTheme: dark, variables: { colorText: colorName } }}/>
			</div>
			<AudioInput
				filename={selectedUpload?.filename}
				text={selectedUpload?.text}
			/>
		</div>
	</div>
}