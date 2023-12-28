import type { debug } from './utils'
import type { MidjourneyWs } from './ws'

export interface MidJourneyFullOptions {
  token: string
  guild_id: string
  channel_id: string
  skipHeartbeat: boolean
  apiBaseUrl: string
  wsBaseUrl: string
  imgBaseUrl: string
  fetch: typeof fetch
  discordsaysUrl: string
  session_id?: string
  ws?: MidjourneyWs
  user?: MjOriginMessage['user']
  debug?: typeof debug
}

export type MidJourneyOptions = Pick<
  MidJourneyFullOptions,
  'token' | 'channel_id' | 'guild_id'
> &
Partial<
    Omit<
      MidJourneyFullOptions,
      | 'token'
      | 'channel_id'
      | 'guild_id'
      | 'ws'
      | 'user'
      | 'discordsaysUrl'
      | 'session_id'
    >
  >

export interface ApplicationCommond {
  version: string
  id: string
  name: string
  type: number
  options: { type: number, name: string, [key: string]: any }[]
  [key: string]: any
}

export interface MjOriginMessage {
  id: string
  flags: number
  content: string
  type: 0 | 19 | 20
  components: { components: any[] }[]
  attachments: {
    filename: string
    url: string
    height: number
    width: number
  }[]
  timestamp: string
  channel_id: string
  interaction: { name: string }
  embeds: {
    description: string
    title: string
    color: number
    type: string
    footer: { text: string }
  }[]
  message_reference: { message_id: string }
  nonce?: string
  heartbeat_interval?: number
  session_id?: string
  user?: any
  // Vary (Region) or Remix mode
  custom_id?: string
}

export interface MjMessage {
  id: string
  nonce?: string
  flags?: number
  content?: string
  url?: string
  embed?: MjOriginMessage['embeds'][number]
  progress?: number
  components?: MjOriginMessage['components']
  originId?: string
  parentId?: string
  timestamp?: string
  custom_id?: string
  // Vary (Region)
  varyRegionImgBase64?: string
  varyRegionPrompt?: string
  // other...
  [key: string]: any
}

export interface MessageCallBack {
  (type: MjMsgType, msg: MjMessage): void
}

export interface MjEvents extends Record<string, MessageCallBack> {
  READY: (res: any) => void
  WS_OPEN: () => void
  WS_ERROR: (error: string) => void
  WS_CLOSE: () => void
}

export type MjMsgType =
  | 'READY'
  | 'REQUEST_SUCCESS'
  | 'REQUEST_FAILED'
  | 'MESSAGE_CREATE'
  | 'MESSAGE_UPDATE'
  | 'MESSAGE_DELETE'
  | 'INTERACTION_CREATE'
  | 'INTERACTION_SUCCESS'
  | 'INTERACTION_IFRAME_MODAL_CREATE'
  | 'INTERACTION_MODAL_CREATE'
