interface Message {
  id: string
  sender_id: number
  message: string
  created_at: string
  modified_at: string | null
  modified_id: number | ull
  reactions: Reaction[]
}

interface User {
  id: number
  username: string
  role: string
  avatar: string
  color: Color.Hex
  status: ConnectionActivity
}

interface Reaction {
  id: string
  emoji: string
  count: number
}

interface MessageState {
  messages: Message[]
}

type MessageAction =
  | { type: 'INIT', payload: Message[] }
  | { type: 'ADD'; payload: Message }
  | { type: 'EDIT'; payload: Message }
  | { type: 'REMOVE'; payload: { id: Message['id'] } }
  | { type: 'REACT'; payload: { id: Message['id']; reaction: Reaction } }

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
