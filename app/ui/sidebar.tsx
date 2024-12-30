import SidebarItem from '@ui/sidebar-item'
import type { Upload } from '@prisma/client'

export default ({
	uploads = []
}: {
	uploads?: Upload[]
}) => {
	return <div>{uploads.map(upload => <SidebarItem
		key={upload.id}
		id={upload.id}
		filename={upload.filename}
		date={upload.createdAt}
	/>)}</div>
}