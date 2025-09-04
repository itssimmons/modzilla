interface Chat {
  id: UUID
  sender_id: ID
  message: string
  room_id: UUID
  created_at: string
  modified_at: string | null
  modified_id: number | null
  player: User
  reactions: Reaction[]
}

interface ChatState {
  messages: Chat[]
}

type ChatAction =
  | { type: 'INIT', payload: Chat[] }
  | { type: 'ADD'; payload: { message: Chat; roomId: string } }
  | { type: 'EDIT'; payload: Chat }
  | { type: 'REMOVE'; payload: { id: Chat['id'] } }
  | { type: 'REACT'; payload: { id: Chat['id']; reaction: Exclude<Reaction, 'id'> } }
  | { type: 'UPDATE_REACTIONS'; payload: { id: Chat['id']; reaction: Reaction } }

	
interface Reaction {
  id: number
  chat_id: UUID
  sender_id: number
  emoji: Char
  count: number
  created_at: string
}

