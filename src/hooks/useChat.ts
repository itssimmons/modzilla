import { useEffect } from 'react'

import ChatService from '@/lib/services/Chat.service'
import { toaster } from '@/components/ui/toaster'
import { useMessageDispatch, useMessageState } from '@/providers/Chat.provider'
import channelNp from '@/socket'

import useClipboard from './useClipboard'

export default function useChat() {
  const dispatch = useMessageDispatch()
  const state = useMessageState()

  const clipboard = useClipboard()

  useEffect(() => {
    console.debug(state)
  }, [state])

  const append = ({ message, roomId }: { message: Chat; roomId: string }) => {
    dispatch({ type: 'ADD', payload: { message, roomId } })
  }

  const edit = ({
    id,
    message,
    roomId
  }: {
    id: UUID
    message: string
    roomId: UUID
  }) => {
    dispatch({ type: 'EDIT', payload: { id, message } })
    ChatService.edit({ chatId: id, message, roomId })
      .then(() => {
        channelNp.emit('message:action', {
          event: 'channel:edition',
          room: roomId,
          payload: {
            id,
            message
          }
        })
      })
      .catch(console.error)
  }

  const remove = ({ id, roomId }: { id: UUID; roomId: UUID }) => {
    dispatch({ type: 'REMOVE', payload: { id: id } })
    ChatService.delete({ chatId: id, roomId })
      .then(() => {
        channelNp.emit('message:action', {
          event: 'channel:deletion',
          room: roomId,
          payload: {
            id
          }
        })
      })
      .catch(console.error)
  }

  const react = ({
    id,
    roomId,
    reaction
  }: {
    id: UUID
    roomId: UUID
    reaction: Exclude<Reaction, 'id'>
  }) => {
    dispatch({ type: 'REACT', payload: { id, reaction } })
    ChatService.react({
      roomId: roomId,
      chatId: id,
      emoji: reaction.emoji,
      senderId: reaction.sender_id
    })
      .then(() => {
        channelNp.emit('message:action', {
          event: 'channel:reaction',
          room: roomId,
          payload: {
            id,
            reaction
          }
        })
      })
      .catch(console.error)
  }

  const copy = (text: string) => {
    clipboard
      .copy(text)
      .then(() => {
        toaster.create({
          description: 'Message content copied to clipboard',
          type: 'info'
        })
      })
      .catch(console.error)
  }

  return {
    state: state.messages,
    append,
    edit,
    remove,
    react,
    copy,
    dispatch
  }
}
