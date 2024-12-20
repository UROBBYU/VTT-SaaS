import AudioInput from '@ui/audio-input'
import Sidebar from '@ui/sidebar'
import {
	SignedOut,
	SignInButton,
	SignedIn,
	UserButton
} from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default () => {

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
				<div className="w-100 border-r border-gray-500 bg-sec">
					<div className="flex justify-end p-2 w-full">
						<UserButton showName appearance={{ baseTheme: dark }}/>
					</div>
					<Sidebar/>
				</div>
				<div className="flex flex-col justify-end w-full h-screen">
					<AudioInput/>
				</div>
			</div>
		</SignedIn>
	</main>
}
