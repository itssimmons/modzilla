import { useContext } from 'react'

import { RoomContext } from '@/providers/Room.provider'

export default function useRoom() {
  const state = useContext(RoomContext)

  return {
    room: state
  }
}
