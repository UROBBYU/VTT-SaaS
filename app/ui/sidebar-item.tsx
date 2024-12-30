import Link from 'next/link'

export default ({
	id,
	filename,
	date
}: {
	id: string
	filename: string
	date: Date
}) =>
<Link
	href={`/?id=${id}`}
	className='block mt-4 mr-2 p-2 rounded-e-xl select-none cursor-pointer bg-light hover:opacity-80 active:opacity-60'

>
	<p className='text-sm opacity-60'>{date.toDateString()} at {date.toTimeString().substring(0, 8)}</p>
	<p className='font-mono tracking-tight'>{filename}</p>
</Link>