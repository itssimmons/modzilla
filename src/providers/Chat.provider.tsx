import { createContext, useContext, useReducer, type Dispatch } from 'react'

import ChatService from '@/lib/services/Chat.service'
import useHydratedEffect from '@/hooks/useHydratedEffect'
import messageReducer, { initialState } from '@/reducers/message.reducer'

const StateContext = createContext<ChatState | undefined>(undefined)
const DispatchContext = createContext<Dispatch<ChatAction> | undefined>(
  undefined
)

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState)

  useHydratedEffect(() => {
    const init = async () => {
      const roomId = new URLSearchParams(window.location.search).get('roomId')!
      const messages = await ChatService.all({ roomId })
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
  if (!context) throw new Error('useMessageState must be used within ChatProvider')
  return context
}

export function useMessageDispatch() {
  const context = useContext(DispatchContext)
  if (!context)
    throw new Error('useMessageDispatch must be used within ChatProvider')
  return context
}

export default ChatProvider
