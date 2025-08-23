import http from '@/lib/helpers/http'
import { env } from '@/env'

import 'isomorphic-fetch'

class RoomService {
  public static async get(roomId: string) {
    const res = await http<Room>(`/channels/${roomId}/`, {
      method: 'GET',
      redirect: 'follow',
      baseUrl: env.VITE_BASE_URL
    })

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const room = await res.json()
    return room
  }
}

export default RoomService
