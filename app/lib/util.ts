export const LOG1000 = Math.log(1000)

export const getDataSizeUnit = (v: number,
	_v = v > 0 ? Math.trunc(Math.log(Math.abs(v)) / LOG1000) : 0
): [unit: string, power: number] => [(_v ? 'KMGTPEZY'[_v - 1] : '') + 'B', _v]

export const roundTo = (n: number, p: number, _n = 10 ** p) => Math.round(n * _n) / _n