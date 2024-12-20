export default ({
	filename,
	date
}: {
	filename: string
	date: Date
}) => <div className="mb-2 p-2 border-y border-gray-300 rounded-md select-none cursor-pointer">
	<p className="text-sm text-gray-300">{date.toDateString()} at {date.getHours()}:{date.getMinutes()}:{date.getSeconds()}</p>
	<p>{filename}</p>
</div>