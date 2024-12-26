import prisma from '@lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import AudioInput from '@ui/audio-input'
import Sidebar from '@ui/sidebar'
import {
	SignedOut,
	SignInButton,
	SignedIn,
	UserButton
} from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default async (props: { searchParams?: Promise<{ id?: string }> }) => {
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
	performance.now()

	if (!userDB) throw new Error(`No DB entry found for (${user.id}).`)

	const uploads = userDB.uploads
	let selectedUpload: {
		filename: string
		text: string
	} | undefined

	const searchParams = await props.searchParams
	const upId = searchParams?.id
	if (upId) selectedUpload = uploads.find(up => up.id === upId)

	return <main>
		<SignedOut>
			<div className="flex flex-col justify-center w-screen h-screen">
				<div className="flex justify-center text-xl">
					<SignInButton/>
				</div>
			</div>
		</SignedOut>
		<SignedIn>
			<div className="flex">
				<div className="w-100 bg-dark">
					<div className="flex justify-end p-2 w-full">
						<UserButton showName appearance={{ baseTheme: dark }}/>
					</div>
					<Sidebar uploads={uploads}/>
				</div>
				<AudioInput
					filename={selectedUpload?.filename}
					text={selectedUpload?.text}
				/>
			</div>
		</SignedIn>
	</main>
}
