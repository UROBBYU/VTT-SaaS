import prisma from '@lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import SidebarItem from '@ui/sidebar-item'

export default async () => {
	const user = await currentUser()

	if (!user) throw new Error('Not Authorized.')

	const userDB = await prisma.user.findUnique({
		where: { clerkId: user.id },
		select: { uploads: true }
	})

	if (!userDB) throw new Error('No DB entry found.')

	return <div>{userDB.uploads.map(upload => <SidebarItem
		key={upload.id}
		filename={upload.filename}
		date={upload.createdAt}
	/>)}</div>
}