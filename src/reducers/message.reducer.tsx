export const initialState: ChatState = {
  messages: []
}

export enum MessageActionType {
  INIT = 'INIT',
  ADD = 'ADD',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE',
  REACT = 'REACT'
}

export default function messageReducer(
  state: ChatState,
  action: ChatAction
): ChatState {
  switch (action.type) {
    case MessageActionType.INIT:
      return { ...state, messages: action.payload }
    case MessageActionType.ADD:
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
      }
    case 'EDIT':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.id ? action.payload : message
        )
      }
    case 'REACT':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.id
            ? {
                ...message,
                reactions: [
                  ...(message?.reactions ?? []),
                  action.payload.reaction
                ]
              }
            : message
        )
      }
    case 'REMOVE':
      return {
        ...state,
        messages: state.messages.filter(
          (message) => message.id !== action.payload.id
        )
      }
    default:
      return state
  }
}
