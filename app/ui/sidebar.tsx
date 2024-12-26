import SidebarItem from '@ui/sidebar-item'
import type { Upload } from '@prisma/client'

export default async ({
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