import { createContext, useContext, useReducer, type Dispatch } from 'react'

import playerReducer, { initialState } from '@/reducers/player.reducer'

const StateContext = createContext<PlayerState | undefined>(undefined)
const DispatchContext = createContext<Dispatch<PlayerAction> | undefined>(
  undefined
)

const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function usePlayerState() {
  const context = useContext(StateContext)
  if (!context)
    throw new Error('useMessageState must be used within ChatProvider')
  return context
}

export function usePlayerDispatch() {
  const context = useContext(DispatchContext)
  if (!context)
    throw new Error('useMessageDispatch must be used within ChatProvider')
  return context
}

export default PlayerProvider
