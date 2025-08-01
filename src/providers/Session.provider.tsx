import { createContext, useMemo, useState } from 'react'

export const SessionCtx = createContext<{
  session: User | null
  setSession: (session: User | null) => void
}>({
  session: null,
  setSession: () => null
})

const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<User | null>(null)

  const value = useMemo(() => ({ session, setSession }), [session])

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

export default SessionProvider
