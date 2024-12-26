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
	className="block mb-4 mr-2 p-2 rounded-e-xl select-none cursor-pointer bg-light"

>
	<p className="text-sm text-gray-300">{date.toDateString()} at {date.getHours()}:{date.getMinutes()}:{date.getSeconds()}</p>
	<p>{filename}</p>
</Link>