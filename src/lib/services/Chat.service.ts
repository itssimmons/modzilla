import http from '@/lib/helpers/http'
import { env } from '@/env'

import 'isomorphic-fetch'

class ChatService {
  public static async all({ roomId }: { roomId: string }) {
    const res = await http<Chat[]>(`/chats/channel/${roomId}/`, {
      method: 'GET',
      redirect: 'follow',
      baseUrl: env.VITE_BASE_URL
    })

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const chats = await res.json()
    return chats
  }

  public static async send({
    message,
    senderId: sender_id,
    roomId: room_id
  }: {
    message: string
    senderId: number
    roomId: string
  }) {
    const res = await http<Chat>(`/chats/channel/${room_id}/`, {
      method: 'POST',
      redirect: 'follow',
      baseUrl: env.VITE_BASE_URL,
      body: { message, sender_id },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const newMessage = await res.json()
    return newMessage
  }
}

export default ChatService
