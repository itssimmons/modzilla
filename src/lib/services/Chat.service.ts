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

  public static async react(payload: {
    roomId: UUID
    chatId: UUID
    emoji: Char
    senderId: ID
  }) {
    const res = await http<Chat>(
      `/chats/channel/${payload.roomId}/${payload.chatId}/react/`,
      {
        method: 'POST',
        redirect: 'follow',
        baseUrl: env.VITE_BASE_URL,
        body: { emoji: payload.emoji, sender_id: payload.senderId },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const newReaction = await res.json()
    return newReaction
  }

  public static async edit(payload: {
    roomId: UUID
    message: string
    chatId: UUID
  }) {
    const res = await http<Chat>(
      `/chats/channel/${payload.roomId}/${payload.chatId}/edit/`,
      {
        method: 'PATCH',
        redirect: 'follow',
        baseUrl: env.VITE_BASE_URL,
        body: { message: payload.message },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const editedMessage = await res.json()
    return editedMessage
  }

  public static async delete(payload: { chatId: UUID; roomId: UUID }) {
    const res = await http<Chat>(
      `/chats/channel/${payload.roomId}/${payload.chatId}/delete/`,
      {
        method: 'DELETE',
        redirect: 'follow',
        baseUrl: env.VITE_BASE_URL
      }
    )

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const deletedMessage = await res.json()
    return deletedMessage
  }
}

export default ChatService
