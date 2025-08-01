export default function debounce(
  callback: (...args: unknown[]) => void,
  wait: number
) {
  let timeoutId: number
  return (...args: unknown[]) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      callback(...args)
    }, wait)
  }
}
