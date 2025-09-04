
interface User {
  id: ID
  username: string
  role: string
  avatar: string
  color: Color.Hex
  status: ConnectionActivity
}

namespace Player {
  export type Coords = {
    user_id: number
    color: Color.Hex | `{${string}}`
    room: string
    username: string
  } & AxisCoords
}

