import { toaster } from '@/components/ui/toaster'
import { Status } from '@/enums'
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

  const block = (payload: {
    roomId: UUID
    to: { id: ID; sid: string }
    from: { username: string }
  }) => {
    dispatch({ type: PlayerActionType.BLOCK, payload })
    channelNp.emit('player:action', {
      event: 'channel:block',
      payload: {
        to: payload.to,
        from: payload.from
      }
    })
    channelNp.emit('player:action', {
      event: 'channel:status',
      room: payload.roomId,
      payload: {
        user: { ...payload.to, status: Status.Blocked }
      }
    })
  }

  const whisperTo = (payload: Pick<User, 'username' | 'id' | 'sid'>) => {
    dispatch({ type: PlayerActionType.WHISPERING, payload })
  }

  const whisperSubmit = (payload: {
    to: { id: ID; sid: string }
    from: { username: string }
    whisper: string
  }) => {
    dispatch({ type: PlayerActionType.WHISPERING, payload: null })
    channelNp.emit('player:action', {
      event: 'channel:whisper',
      room: null,
      payload: {
        to: payload.to,
        from: payload.from,
        whisper: payload.whisper
      }
    })
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
