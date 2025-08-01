import {
  useMessageDispatch,
  useMessageState
} from '@/providers/Message.provider'
import { useEffect } from 'react'

export default function useMessage() {
  const dispatch = useMessageDispatch()
  const state = useMessageState()
	
	useEffect(() => {
    console.debug(state)
  }, [state])

  const append = (message: Message) => {
    dispatch({ type: 'ADD', payload: message })
  }

  const edit = (message: Message) => {
    dispatch({ type: 'EDIT', payload: message })
  }

  const remove = (id: Message['id']) => {
    dispatch({ type: 'REMOVE', payload: { id } })
  }

  const react = (id: Message['id'], reaction: Reaction) => {
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
