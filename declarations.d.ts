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

type AxisCoords = { x: number; y: number }

namespace Player {
  export type Coords = {
    user_id: number
    color: Color.Hex | `{${string}}`
    room: string
    username: string
  } & AxisCoords
}

namespace Color {
  export type Hex = `#${string}`
}
