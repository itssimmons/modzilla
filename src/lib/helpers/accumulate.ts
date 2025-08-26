export default function accumulate(arr: Record<string, any>[], key: string) {
	if (arr.length <= 0) return 0;
	
	if (typeof arr[0][key] !== 'number') {
		throw new TypeError('Only fields of type numbers are accumulables')
	}
	
	let acc = 0;

	for (const item of arr) {
		acc += item?.[key] ?? 0
	}

	return acc
}