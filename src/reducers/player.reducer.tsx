export const initialState: PlayerState = {
  whispering: null
}

export enum PlayerActionType {
  WHISPERING = 'WHISPERING'
}

export default function playerReducer(
  state: PlayerState,
  action: PlayerAction
): PlayerState {
  switch (action.type) {
    case PlayerActionType.WHISPERING:
      return { ...state, whispering: action.payload }
    default:
      return state
  }
}
