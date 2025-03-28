import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Button, HStack, Textarea, type StackProps } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid';

import channelNp from '@/socket'
import Dayjs from '@/third-party/day'
import ChatService from '@/services/Chat.service';

interface TextBoxProps extends StackProps {
  dispatch: Dispatch<SetStateAction<Message[]>>
}

export default function TextBox({
  dispatch,
  ...props
}: TextBoxProps) {
  const [txt, setTxt] = useState('')

  const location = useMemo(() => window.location, [window.location])
  const emptyTxt = useMemo(() => txt.trim().length <= 0, [txt])

  const handleSend = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const searchParams = new URLSearchParams(location.search)

    const id = uuidv4()
    const userId = searchParams.get('userId')!
    const roomId = searchParams.get('roomId')!

    const newMessage = {
      id,
      message: txt.trim(),
      sender_id: Number(userId),
      created_at: Dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modified_at: null,
      modified_id: null
    }

    setTxt('')

    dispatch((prev) => [...prev, newMessage])
    ChatService.save({ message: txt, userId: Number(userId) })

    channelNp.emit('message', {
      room: roomId,
      user_id: Number(userId),
      message: txt
    })
  }

  return (
    <HStack
      as='footer'
      data-role='message-box'
      gridRow='2'
      h='full'
      gridColumn={'2/3'}
      gap={0}
      {...props}
    >
      <Textarea
        onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSend(e)
          }
        }}
        value={txt}
        placeholder='Start writing your (Real-Time) message...'
        resize='none'
        size='xs'
        p={2}
        h='full'
        fontSize='sm'
        borderRadius={0}
        borderLeft='none'
        borderBottom='none'
        borderRight='none'
        outline='none'
        _focus={{ borderTopColor: 'border' }}
      ></Textarea>
      <Button
        onClick={handleSend}
        disabled={emptyTxt}
        variant='solid'
        h='full'
        w='100px'
        fontSize='sm'
        type='button'
        backgroundColor='green.400'
        borderRadius={0}
      >
        Send
      </Button>
    </HStack>
  )
}
