import { createContext, useMemo, useState } from 'react'

import RoomService from '@/lib/services/Room.service'
import useHydratedEffect from '@/hooks/useHydratedEffect'

export const RoomContext = createContext<Room | null>(null)

const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [room, setRoom] = useState<Room | null>(null)

  const location = useMemo(() => window.location, [])
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location]
  )

  const roomId = useMemo(() => searchParams.get('roomId'), [searchParams])

  useHydratedEffect(() => {
    console.log(roomId, typeof roomId)
    if (!roomId) {
      setRoom(null)
      return
    }

    RoomService.get(roomId).then(setRoom)
  }, [roomId])

  const value = useMemo(() => room, [room])

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export default RoomProvider
