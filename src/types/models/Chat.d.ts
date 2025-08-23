interface Chat {
  id: string
  sender_id: number
  message: string
  room_id: string
  created_at: string
  modified_at: string | null
  modified_id: number | ull
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
  | { type: 'REACT'; payload: { id: Chat['id']; reaction: Reaction } }

	
interface Reaction {
  id: string
  chat_id: string
  sender_id: number
  emoji: string
  count: number
  created_at: string
}

