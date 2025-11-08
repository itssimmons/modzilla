export const initialState: PlayerState = {
  whispering: null
}

export enum PlayerActionType {
  WHISPERING = 'WHISPERING',
  BLOCK = 'BLOCK'
}

export default function playerReducer(
  state: PlayerState,
  action: PlayerAction
): PlayerState {
  switch (action.type) {
    case PlayerActionType.WHISPERING:
      return { ...state, whispering: action.payload }
    case PlayerActionType.BLOCK:
      // pass
      return state
    default:
      return state
  }
}
