import Dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import relativeTime from 'dayjs/plugin/relativeTime'
Dayjs.extend(isBetween)
Dayjs.extend(isSameOrBefore)
Dayjs.extend(isSameOrAfter)
Dayjs.extend(relativeTime)
export const dayjs = Dayjs
