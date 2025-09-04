import { useEffect } from 'react'

import ChatService from '@/lib/services/Chat.service'
import { useMessageDispatch, useMessageState } from '@/providers/Chat.provider'

export default function useChat() {
  const dispatch = useMessageDispatch()
  const state = useMessageState()

  useEffect(() => {
    console.debug(state)
  }, [state])

  const append = ({ message, roomId }: { message: Chat; roomId: string }) => {
    dispatch({ type: 'ADD', payload: { message, roomId } })
  }

  const edit = (message: Chat) => {
    dispatch({ type: 'EDIT', payload: message })
  }

  const remove = (id: Chat['id']) => {
    dispatch({ type: 'REMOVE', payload: { id } })
  }

  const react = (
    { id, roomId }: { id: UUID; roomId: UUID },
    reaction: Exclude<Reaction, 'id'>
  ) => {
    dispatch({ type: 'REACT', payload: { id, reaction } })
    ChatService.react({
      roomId: roomId,
      chatId: id,
      emoji: reaction.emoji,
      senderId: reaction.sender_id
    }).catch(console.error)
  }

  const updateReactions = (id: UUID, reaction: Reaction) => {
    dispatch({ type: 'UPDATE_REACTIONS', payload: { id, reaction } })
  }

  return {
    state: state.messages,
    append,
    edit,
    remove,
    react,
    updateReactions
  }
}
