import { useState, useEffect } from 'react'

export function useLiveClock() {
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const utcString = time.toISOString().split('T')[1].split('.')[0] + ' UTC'

  return { time, utcString }
}
