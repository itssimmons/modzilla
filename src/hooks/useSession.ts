import { useContext, useMemo } from 'react'

import { sessionCtx } from '@/lib/providers/Session.provider'

export default function useSession() {
  const { session, setSession } = useContext(sessionCtx)

  const room = useMemo(
    () => new URLSearchParams(window.location.search).get('roomId') ?? null,
    []
  )

  return { session, room, setSession }
}
