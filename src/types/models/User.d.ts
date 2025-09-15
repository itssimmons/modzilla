interface User {
  id: ID
  username: string
  role: string
  avatar: string
  sid: string
  color: Color.Hex
  status: ConnectionActivity
}

type PlayerState = {
  whispering: Pick<User, 'username' | 'id' | 'sid'> | null
}

type PlayerAction = { type: 'WHISPERING'; payload: Pick<User, 'username' | 'id'> | null }

namespace Player {
  export type Coords = {
    user_id: number
    color: Color.Hex
    room: string
    username: string
  } & AxisCoords
}
