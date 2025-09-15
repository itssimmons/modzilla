import { memo, useEffect, useMemo, useState } from 'react'
import { Icon } from '@chakra-ui/react'

import contrastColor from '@/lib/helpers/contrastRatio'
import useDebounce from '@/hooks/useDebounce'
import useRoom from '@/hooks/useRoom'
import useSession from '@/hooks/useSession'
import { Status } from '@/enums'
import channelNp from '@/socket'

import Cursor from './icon/cursor'
import { Tooltip } from './ui/tooltip'

interface PlayerCursorsProps {
  players: User[]
}

function PlayerCursors({ players }: PlayerCursorsProps) {
  const { session } = useSession()
  const { room } = useRoom()

  const [cursors, setCursors] = useState<Player.Coords[]>([])
  const [coords, setCoords] = useState<AxisCoords>({ x: 0, y: 0 })
  const debouncedCoords = useDebounce(coords, 125)

  useEffect(() => {
    const listener = (ev: MouseEvent) => {
      if (!session) return
      setCoords({ x: ev.clientX, y: ev.clientY })
    }

    document.addEventListener('mousemove', listener)
    return () => {
      document.removeEventListener('mousemove', listener)
    }
  }, [session])

  useEffect(() => {
    if (!session) return

    const { x, y } = debouncedCoords

    const payload = {
      x,
      y,
      user_id: session.id,
      color: session.color,
      username: session.username,
      room: room!.id
    }

    console.debug('sending cursor coords: ', payload)
    channelNp.emit('cursor:move', payload)
  }, [debouncedCoords, session, room])

  useEffect(() => {
    channelNp.on('cursor:move', (payload: Player.Coords) => {
      console.debug('received cursor coords: ', payload)

      const mutableCursors = [...cursors]
      const existingCursor = mutableCursors.findIndex(
        (c) => c.user_id === payload.user_id
      )
      if (existingCursor !== -1) {
        mutableCursors[existingCursor]['x'] = payload.x
        mutableCursors[existingCursor]['y'] = payload.y
      } else {
        mutableCursors.push(payload)
      }

      setCursors(mutableCursors)
    })

    return () => {
      channelNp.off('cursor:move')
    }
  }, [cursors])

  const playerCursors = useMemo(
    () =>
      cursors.filter((c) => {
        const isOffline = players.some(
          (p) => p.id === c.user_id && p.status === Status.Offline
        )
        return !isOffline
      }),
    [cursors, players]
  )

  return (
    <>
      <Icon
        position='absolute'
        color={session?.color ?? 'gray.100'}
        left='0px'
        top='0px'
        transform={`translate(${coords.x - 16}px, ${coords.y - 12}px)`}
        cursor='none'
        pointerEvents='none'
        userSelect='none'
        zIndex={100_000_000_000} // above everything
      >
        <Cursor />
      </Icon>

      {playerCursors.map((c) => {
        const player = players.find((p) => p.id === c.user_id)!
        const isIdle = player.status === Status.Idle

        return (
          <Tooltip
            key={c.user_id}
            content={`${c.username} (${player.status})`}
            positioning={{
              placement: 'bottom-start',
              offset: { crossAxis: 28, mainAxis: -4 }
            }}
            contentProps={{
              fontSize: 'x-small',
              background: c.color ?? 'gray.700',
              color:
                contrastColor('#000000', c.color ?? '#000000') > 4.5
                  ? '#000000'
                  : '#FFFFFF',
              padding: 0.5,
            }}
          >
            <Icon
              position='absolute'
              color={c.color ?? 'gray.100'}
              left='0px'
              top='0px'
              transition={`transform 300ms ease-in-out,
                opacity 300ms ease-in-out`}
              transform={`translate(${c.x - 16}px, ${c.y - 12}px)`}
              cursor='none'
              userSelect='none'
              zIndex='tooltip'
              opacity={isIdle ? 0.3 : 1}
            >
              <Cursor />
            </Icon>
          </Tooltip>
        )
      })}
    </>
  )
}

export default memo(PlayerCursors)
