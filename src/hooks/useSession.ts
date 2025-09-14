import { useContext } from 'react'

import { SessionCtx } from '@/providers/Session.provider'

export default function useSession() {
  const { session, setSession } = useContext(SessionCtx)

  return { session, setSession }
}
