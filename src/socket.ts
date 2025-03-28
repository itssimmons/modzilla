import { io } from 'socket.io-client'

const channelNp = io('/channel', {
  transports: ['websocket']
})

export default channelNp
