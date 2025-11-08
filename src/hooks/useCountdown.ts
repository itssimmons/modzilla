import { useRef } from 'react'

type TimeUnit = 'm' | 's' | 'ms'

/**
 * A hook that provides a countdown timer functionality.
 *
 * @param ms - The starting point of the countdown in milliseconds. Default is 1000.
 * @returns An object containing the current milliseconds, and functions to start and stop the countdown.
 */
export default function useCountdown(ms: number = 1000) {
  const millisecondsRef = useRef<number>(ms)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      millisecondsRef.current -= 100
      if (millisecondsRef.current <= 0) {
        stop()
      }
      // console.log('millisecondsRef=', millisecondsRef.current)
    }, 100)
  }

  const stop = () => {
    clearInterval(intervalRef.current!)
  }

  const clear = () => {
    millisecondsRef.current = ms
    clearInterval(intervalRef.current!)
    intervalRef.current = null
  }

  const format = (unit: TimeUnit): string => {
    const cases = {
      m: Math.floor(signal() / 60000),
      s: Math.floor((signal() % 60000) / 1000),
      ms: signal() % 1000
    }

    return cases[unit].toFixed(2).padStart(2, '0')
  }

  const signal = () => millisecondsRef.current

  return {
    signal,
    start,
    stop,
    clear,
    format
  }
}
