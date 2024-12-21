import prisma from '@lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import SidebarItem from '@ui/sidebar-item'

export default async () => {
	const user = await currentUser()

	if (!user) throw new Error('Not Authorized.')

	const checkDB = async (updateTime: number): Promise<typeof userDB> => {
		let userDB = await prisma.user.findUnique({
			where: { clerkId: user.id },
			select: { uploads: true }
		})

		const sinceUpdate = Date.now() - updateTime
		if (!userDB && (sinceUpdate < 6e4)) {
			await new Promise(res => setTimeout(res, 5e3))

			userDB = await checkDB(updateTime)
		}

		return userDB
	}

	const userDB = await checkDB(user.updatedAt)

	if (!userDB) throw new Error(`No DB entry found for (${user.id}).`)

	return <div>{userDB.uploads.map(upload => <SidebarItem
		key={upload.id}
		filename={upload.filename}
		date={upload.createdAt}
	/>)}</div>
}