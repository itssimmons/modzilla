import { sessionCtx } from "@/lib/providers/Session.provider"
import { useContext } from "react"

export default function useSession() {
  const { session, setSession } = useContext(sessionCtx)
  return { session, setSession }
}