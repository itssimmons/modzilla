import { useEffect } from 'react'

import {
  useMessageDispatch,
  useMessageState
} from '@/providers/Chat.provider'

export default function useChat() {
  const dispatch = useMessageDispatch()
  const state = useMessageState()

  useEffect(() => {
    console.debug(state)
  }, [state])

  const append = ({
    message,
    roomId
  }: {
    message: Chat
    roomId: string
  }) => {
    dispatch({ type: 'ADD', payload: { message, roomId } })
  }

  const edit = (message: Chat) => {
    dispatch({ type: 'EDIT', payload: message })
  }

  const remove = (id: Chat['id']) => {
    dispatch({ type: 'REMOVE', payload: { id } })
  }

  const react = (id: Chat['id'], reaction: Exclude<Reaction, 'id'>) => {
    dispatch({ type: 'REACT', payload: { id, reaction } })
  }

  return {
    state: state.messages,
    append,
    edit,
    remove,
    react
  }
}
