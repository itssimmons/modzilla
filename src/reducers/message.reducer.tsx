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
        messages: [...state.messages, action.payload.message]
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
        messages: state.messages.map((message) => {
          if (message.id === action.payload.id) {
            const mutableMessage = { ...message }
            // const id = mutableMessage.reactions.length + 1
            const reaction = { ...action.payload.reaction }

            const idx = mutableMessage.reactions.findIndex(
              (r) => r.emoji === reaction.emoji
            )

            if (idx !== -1) {
              mutableMessage.reactions[idx].count += 1
            } else {
              mutableMessage.reactions.push(reaction)
            }

            return {
              ...mutableMessage,
              reactions: mutableMessage.reactions
            }
          }

          return message
        })
      }
    case 'REMOVE':
      return {
        ...state,
        messages: state.messages.filter(
          (message) => message.id !== action.payload.id
        )
      }
    case 'UPDATE_REACTIONS':
      return {
        ...state,
        messages: state.messages.map((message) => {
          if (message.id === action.payload.id) {
            return {
              ...message,
              reactions: [
                ...message.reactions,
                action.payload.reaction
              ]
            }
          }

          return message
        })
      }
    default:
      return state
  }
}
