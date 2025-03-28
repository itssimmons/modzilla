import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import 'dayjs/locale/en'

dayjs.extend(relativeTime)
dayjs.locale('en')

const Dayjs = dayjs

export default Dayjs
