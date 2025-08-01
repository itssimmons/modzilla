import { useContext, useMemo } from 'react'

import { SessionCtx } from '@/providers/Session.provider'

export default function useSession() {
  const { session, setSession } = useContext(SessionCtx)

  const room = useMemo(
    () => new URLSearchParams(window.location.search).get('roomID') ?? null,
    []
  )

  return { session, room, setSession }
}
