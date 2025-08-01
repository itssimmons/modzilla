import http from '@/lib/helpers/http'
import { env } from '@/env'

import 'isomorphic-fetch'

class ChatService {
  public static async all() {
    const res = await http<Message[]>('/chats/channel', {
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

  public static async save({
    message,
    userID: user_id
  }: {
    message: string
    userID: number
  }) {
    const res = await http<Message>('/chats/channel', {
      method: 'POST',
      redirect: 'follow',
      baseUrl: env.VITE_BASE_URL,
      body: { message, user_id },
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
