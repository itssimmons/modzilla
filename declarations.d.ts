interface Message {
  id: string
  sender_id: number
  message: string
  created_at: string
  modified_at: string | null
  modified_id: number | ull
}

interface User {
  id: number
  username: string
  role: string
  avatar: string
  color: Color.Hex
  status: ConnectionActivity
}

namespace Color {
  export type Hex = `#${string}`
}
