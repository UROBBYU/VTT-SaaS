import { z } from 'zod'

export const LOG1000 = Math.log(1000)

export const getDataSizeUnit = (v: number,
	_v = v > 0 ? Math.trunc(Math.log(Math.abs(v)) / LOG1000) : 0
): [unit: string, power: number] => [(_v ? 'KMGTPEZY'[_v - 1] : '') + 'B', _v]

export const roundTo = (n: number, p: number, _n = 10 ** p) => Math.round(n * _n) / _n

const ALLOWED_AUDIO_SIZE = process.env.ALLOWED_AUDIO_SIZE ?? 1e6
const audioSizeUnit = getDataSizeUnit(ALLOWED_AUDIO_SIZE)
const ALLOWED_AUDIO_SIZE_TEXT =
	`${Math.round(ALLOWED_AUDIO_SIZE / 1e3 ** audioSizeUnit[1] * 1e2) / 1e2} ${audioSizeUnit[0]}`

export const ALLOWED_AUDIO_EXTENSIONS = [
	'mp3',
	'mp4',
	'mpeg',
	'mpga',
	'm4a',
	'wav',
	'webm'
]

const checkFileSize = (file: File) => file.size <= ALLOWED_AUDIO_SIZE && file.size <= 25e6

const checkFileType = (file: File) =>
	ALLOWED_AUDIO_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() ?? '')

const AudioFileScheme = z.instanceof(File)
	.refine(checkFileSize, `File size exceeds ${ALLOWED_AUDIO_SIZE_TEXT}.`)
	.refine(checkFileType, 'Incorrect file type.')

export const parseAudioFile = AudioFileScheme.safeParse