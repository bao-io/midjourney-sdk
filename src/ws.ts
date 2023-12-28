import EventEmitter from 'eventemitter3'
import WebSocket from 'isomorphic-ws'
import type {
  MessageCallBack,
  MidJourneyFullOptions,
  MjEvents,
  MjMessage,
  MjMsgType,
  MjOriginMessage,
} from './types'
import { MidjourneyMsgMap } from './msgMap'
import { formatComponents, matchRegionNonce } from './utils'

export class MidjourneyWs extends EventEmitter<MjEvents> {
  wsClient: WebSocket
  private lastSequence: number | null = null
  private heartbeatTask: NodeJS.Timer | null = null
  private reconnectionTask: NodeJS.Timeout | null = null
  private msgMap = new MidjourneyMsgMap()

  constructor(public opts: MidJourneyFullOptions) {
    super()
    this.wsClient = this.connect()
  }

  private connect() {
    if (!this.opts.wsBaseUrl)
      throw new Error('wsBaseUrl can\'t be empty')
    const wsClient = new WebSocket(this.opts.wsBaseUrl)
    wsClient.addEventListener('open', () => {
      this.emit('WS_OPEN')
      this.opts.debug?.('MidjourneyWs', 'connect')('wsClient is open!')
      if (this.reconnectionTask) {
        clearTimeout(this.reconnectionTask)
        this.reconnectionTask = null
      }
    })
    wsClient.addEventListener('message', this.message.bind(this))
    wsClient.addEventListener('error', (err) => {
      this.emit('WS_ERROR', err.message)
      this.opts.debug?.(
        'MidjourneyWs',
        'connect',
      )(`discord wsClient occurred an error: ${err.message}`)
      this.wsClient.close()
    })
    wsClient.addEventListener('close', ({ code, reason }) => {
      this.emit('WS_CLOSE')
      this.opts.debug?.(
        'MidjourneyWs',
        'connect',
      )(
        `discord wsClient was close, error code: ${code}, error reason: ${reason}`,
      )
      if (code === 4004) {
        // Authorization faild
        this.emit('READY', new Error(reason))
      }
      else {
        this.reconnectionTask = setTimeout(() => {
          this.opts.debug?.(
            'MidjourneyWs',
            'connect',
          )('discord wsClient reconnect...')
          if (this.heartbeatTask && typeof this.heartbeatTask === 'number') {
            clearInterval(this.heartbeatTask)
            this.heartbeatTask = null
          }
          this.wsClient = this.connect.call(this)
        }, 4000)
      }
    })
    return wsClient
  }

  private auth() {
    this.wsClient.send(
      JSON.stringify({
        op: 2,
        d: {
          token: this.opts.token,
          capabilities: 16381,
          properties: {
            os: 'Mac OS X',
            browser: 'Chrome',
            device: '',
          },
          compress: false,
        },
      }),
    )
  }

  private heartbeat(interval: number) {
    const nextInterval = interval * Math.random()
    !this.opts.skipHeartbeat
    && this.opts.debug?.(
      'MidjourneyWs',
      'heartbeat',
    )(`send discord heartbeat after ${Math.round(nextInterval / 1000)}s`)
    this.heartbeatTask = setTimeout(() => {
      if (this.wsClient.readyState === WebSocket.OPEN) {
        this.wsClient.send(
          JSON.stringify({
            op: 1,
            d: this.lastSequence,
          }),
        )
        this.heartbeat(interval)
      }
    }, nextInterval)
  }

  private message(e: WebSocket.MessageEvent) {
    const payload = JSON.parse(e.data as string)
    const data = payload.d as MjOriginMessage
    const type = payload.t as MjMsgType
    const seq = payload.s as number
    const operate = payload.op as number
    seq && (this.lastSequence = seq)
    this.opts.debug?.(
      'MidjourneyWs',
      'message',
    )(
      [
        { label: 'MessageType', value: type },
        { label: 'MessageOpCode', value: operate },
      ]
        .filter(v => !!v.value)
        .map(v => `${v.label}: ${v.value}`)
        .join(', '),
    )
    if (operate === 10) {
      this.heartbeat(data.heartbeat_interval!)
      this.auth()
    }
    if (type === 'READY') {
      this.opts.session_id = data.session_id
      this.opts.user = data.user
      this.opts.debug?.(
        'MidjourneyWs',
        'message',
      )('wsClient connect successfully!')
      this.emit('READY', data.user)
    }
    if (
      type === 'MESSAGE_CREATE'
        || type === 'MESSAGE_UPDATE'
        || type === 'MESSAGE_DELETE'
        || type === 'INTERACTION_IFRAME_MODAL_CREATE'
        || type === 'INTERACTION_MODAL_CREATE'
    )
      this.handleMessage(type, data)

    if (operate === 11) {
      !this.opts.skipHeartbeat
      && this.opts.debug?.('MidjourneyWs', 'message')('discord heartbeat ack!')
    }
  }

  private handleMessage(type: MjMsgType, message: MjOriginMessage) {
    if (message.channel_id !== this.opts.channel_id)
      return
    if (
      type === 'MESSAGE_CREATE'
        || type === 'INTERACTION_IFRAME_MODAL_CREATE'
        || type === 'INTERACTION_MODAL_CREATE'
    )
      this.handleMessageCreate(type, message)
    else if (type === 'MESSAGE_UPDATE')
      this.handleMessageUpdate('MESSAGE_UPDATE', message)
    else this.handleMessageDelete(message)
  }

  private handleMessageCreate(type: MjMsgType, message: MjOriginMessage) {
    let {
      nonce,
      id,
      embeds = [],
      custom_id,
      content,
      attachments = [],
      components,
    } = message
    nonce = nonce || matchRegionNonce(content)
    if (nonce && !attachments.length) {
      this.msgMap.updateMsgByNonce(id, nonce)
      if (embeds[0]) {
        const { color } = embeds[0]
        switch (color) {
          case 16711680:
            this.emitEmbed(id, 'MESSAGE_CREATE', embeds[0])
            break
          default:
            break
        }
      }
      if (type === 'INTERACTION_IFRAME_MODAL_CREATE' && custom_id) {
        custom_id = custom_id.split('::')[2]
        let varyRegionPrompt = ''
        // you need to configure the frontend proxy if you in the browser environment, you can see the proxy detail in `packages/playground/vite.config.ts` file.
        return this.opts
          .fetch(
            `${this.opts.discordsaysUrl}/inpaint/api/get-image-info/0/0/${custom_id}`,
          )
          .then(async (res) => {
            if (res.ok) {
              const json = await res.json()
              varyRegionPrompt = json.prompt
              const varyRegionImgBase64 = await fetch(
                `${this.opts.discordsaysUrl}/inpaint${json.image_url?.replace(
                  /^\./,
                  '',
                )}`,
              )
                .then(res => res.blob())
                .then(
                  blob =>
                    new Promise<FileReader['result']>((resolve, reject) => {
                      const reader = new FileReader()
                      reader.onload = e =>
                        e.target && resolve(e.target.result)
                      reader.onerror = reject
                      reader.readAsDataURL(blob)
                    }),
                )
              this.emitNonce(nonce!, type, {
                custom_id,
                varyRegionPrompt,
                varyRegionImgBase64: varyRegionImgBase64 as string,
              })
            }
          })
      }
      if (
        type === 'INTERACTION_MODAL_CREATE'
          && custom_id
          && components.length
      ) {
        this.emitNonce(nonce, type, {
          id,
          custom_id,
          components,
        })
      }
    }
    this.handleMessageUpdate('MESSAGE_CREATE', message)
  }

  private handleMessageUpdate(type: MjMsgType, message: MjOriginMessage) {
    const {
      content,
      interaction = {} as MjOriginMessage['interaction'],
      nonce,
      flags,
      components = [],
      embeds = [],
      id,
    } = message
    if (!nonce) {
      const { name } = interaction
      const msg = this.msgMap.getMsgById(id)
      if (msg && msg.nonce) {
        switch (name) {
          case 'settings':
            this.emitNonce(msg.nonce, type, {
              id,
              flags,
              components: formatComponents(components),
              progress: 100,
            })
            return
          case 'info':
            embeds.at(0)
            && this.emitNonce(msg.nonce, type, {
              id,
              embed: embeds[0],
              progress: 100,
            })
            return
        }
      }
    }
    if (content)
      this.processingImage(type, message)
  }

  private handleMessageDelete({ id }: MjOriginMessage) {
    this.emitNonce(id, 'MESSAGE_DELETE', { id }, true)
  }

  private processingImage(type: MjMsgType, message: MjOriginMessage) {
    const {
      content,
      id,
      attachments = [],
      flags,
      components = [],
      nonce,
      timestamp,
      message_reference = {} as MjOriginMessage['message_reference'],
    } = message
    const { message_id: parentId } = message_reference
    const msg
      = this.msgMap.getMsgById(id)
      || (parentId
        ? this.msgMap.getMsgByparentId(parentId)
        : this.msgMap.getMsgByContent(content))
    if (!msg?.nonce)
      return
    let url = attachments.at(0)?.url
    if (url && this.opts.imgBaseUrl)
      url = url.replace('https://cdn.discordapp.com', this.opts.imgBaseUrl)

    const progressMatch = content.match(/\((\d+?)%\)\s\(\w+?\)/)?.[1]
    const isNewCreateMsg
      = !nonce
      && attachments.length
      && components.length
      && type === 'MESSAGE_CREATE'
    const progress = isNewCreateMsg
      ? 100
      : progressMatch
        ? Number.parseInt(progressMatch)
        : 0
    const originId = msg.id !== id ? msg.id : undefined
    const mjMsg = JSON.parse(
      JSON.stringify({
        id,
        url,
        originId,
        content: content.replace(/^\*\*regionNonce:\s\d+?,\s/, '**'),
        parentId,
        flags,
        components: formatComponents(components),
        progress,
        timestamp,
      }),
    )
    this.emitNonce(msg.nonce, type, mjMsg)
  }

  private emitNonce(
    idOrNonce: string,
    type: MjMsgType,
    msg: Partial<MjMessage>,
    isDel = false,
  ) {
    const emitMsg
      = this.msgMap.get(idOrNonce)
      || this.msgMap.getMsgById(idOrNonce)
      || this.msgMap.getMsgByOriginId(idOrNonce)
    emitMsg
    && emitMsg.nonce
    && this.emit(
      emitMsg.nonce,
      type,
      isDel ? (msg as MjMessage) : Object.assign({}, emitMsg, msg),
    )
  }

  private emitEmbed(id: string, type: MjMsgType, embed: MjMessage['embed']) {
    const msg = this.msgMap.getMsgById(id)
    if (!msg || !msg.nonce)
      return
    msg.embed = embed
    this.emitNonce(msg.nonce, type, msg)
  }

  waitReady() {
    return new Promise<MjOriginMessage['user']>((s, j) => {
      this.once('READY', res => (res instanceof Error ? j(res) : s(res)))
    })
  }

  waitMessage({
    nonce,
    parentId,
    cb,
  }: {
    nonce: string
    parentId?: string
    cb?: MessageCallBack
  }) {
    this.msgMap.set(nonce, { id: '', nonce })
    const parentMsg = parentId && this.msgMap.getMsgById(parentId)
    return new Promise<MjMessage>((s, j) => {
      parentMsg
      && parentMsg.nonce
      && this.once(parentMsg.nonce, (type, msg) => {
        cb?.(type, msg)
        this.off(parentMsg.nonce!)
      })
      this.on(nonce, (type, msg) => {
        cb?.(type, msg)
        if (type === 'MESSAGE_DELETE' && msg.id) {
          const final = this.msgMap.getMsgByOriginId(msg.id)
          final && this.off(nonce) && s(final)
          return
        }
        if (
          type === 'INTERACTION_IFRAME_MODAL_CREATE'
            || type === 'INTERACTION_MODAL_CREATE'
        ) {
          this.off(nonce)
          return
        }
        this.msgMap.set(nonce, msg)
        if (msg.error) {
          this.off(nonce)
          j(msg.error)
        }
      })
    })
  }
}
