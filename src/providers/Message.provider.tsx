import { createContext, useContext, useReducer, type Dispatch } from 'react'

import ChatService from '@/lib/services/Chat.service'
import useHydratedEffect from '@/hooks/useHydratedEffect'
import messageReducer, { initialState } from '@/reducers/message.reducer'

const StateContext = createContext<MessageState | undefined>(undefined)
const DispatchContext = createContext<Dispatch<MessageAction> | undefined>(
  undefined
)

const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState)

  useHydratedEffect(() => {
    const init = async () => {
      const messages = await ChatService.all()
      dispatch({ type: 'INIT', payload: messages })
    }

    init()
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useMessageState() {
  const context = useContext(StateContext)
  if (!context) throw new Error('useTodoState must be used within TodoProvider')
  return context
}

export function useMessageDispatch() {
  const context = useContext(DispatchContext)
  if (!context)
    throw new Error('useTodoDispatch must be used within TodoProvider')
  return context
}

export default MessageProvider
