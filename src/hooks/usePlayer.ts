import { toaster } from '@/components/ui/toaster'
import { usePlayerDispatch, usePlayerState } from '@/providers/Player.provider'
import { PlayerActionType } from '@/reducers/player.reducer'
import channelNp from '@/socket'

import useClipboard from './useClipboard'

export function usePlayer() {
  const state = usePlayerState()
  const dispatch = usePlayerDispatch()

  const clipboard = useClipboard()

  const copyTag = (username: string) => {
    clipboard.copy(`@${username}`).then(() => {
      toaster.create({
        description: 'User @tag copied to clipboard',
        type: 'info'
      })
    })
  }

  const block = () => {
    console.log('block')
  }

  const whisperTo = (payload: Pick<User, 'username' | 'id' | 'sid'>) => {
    dispatch({ type: PlayerActionType.WHISPERING, payload })
  }

  const whisperSubmit = (payload: {
    to: { id: ID, sid: string }
    from: { username: string }
    whisper: string
    roomId: UUID
  }) => {
    channelNp.emit('player:action', {
      event: 'channel:whisper',
      room: payload.roomId,
      payload: {
        to: payload.to,
        from: payload.from,
        whisper: payload.whisper
      }
    })
    dispatch({ type: PlayerActionType.WHISPERING, payload: null })
  }

  return {
    copyTag,
    block,
    whisper: {
      to: whisperTo,
      submit: whisperSubmit,
      current: state.whispering
    }
  }
}
