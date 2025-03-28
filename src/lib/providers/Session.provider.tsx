import { createContext, useMemo, useState } from 'react'

export const sessionCtx = createContext<{
  session: User | null
  setSession: (session: User | null) => void
}>({
  session: null,
  setSession: () => null
})

const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<User | null>(null)

  const value = useMemo(() => ({ session, setSession }), [session])

  return <sessionCtx.Provider value={value}>{children}</sessionCtx.Provider>
}

export default SessionProvider
