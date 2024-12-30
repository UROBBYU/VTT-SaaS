import {
	SignedOut,
	SignInButton,
	SignedIn
} from '@clerk/nextjs'
import Uploads from '@ui/uploads'
import prisma from '@lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export default async ({
	searchParams
}: {
	searchParams?: Promise<{ id?: string }>
}) => {
	const user = await currentUser()

	if (!user) throw new Error('Not Authorized.')

	const checkDB = async (updateTime: number): Promise<typeof userDB> => {
		let userDB = await prisma.user.findUnique({
			where: { clerkId: user.id },
			select: { uploads: true }
		})

		const sinceUpdate = performance.now() - updateTime
		if (!userDB && (sinceUpdate < 6e4)) {
			await new Promise(res => setTimeout(res, 5e3))

			userDB = await checkDB(updateTime)
		}

		return userDB
	}

	const userDB = await checkDB(performance.now())

	if (!userDB) throw new Error(`No DB entry found for (${user.id}).`)

	const upId = (await searchParams)?.id

	return <main>
		<SignedOut>
			<div className='flex flex-col justify-center w-screen h-screen'>
				<div className='flex justify-center text-xl'>
					<SignInButton/>
				</div>
			</div>
		</SignedOut>
		<SignedIn>
			<Uploads
				upId={upId}
				uploads={userDB.uploads}
			/>
		</SignedIn>
	</main>
}
