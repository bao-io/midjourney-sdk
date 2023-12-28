import { MidjourneyCommand } from './command'
import type {
  MessageCallBack,
  MidJourneyFullOptions,
  MjOriginMessage,
} from './types'
import { nextNonce } from './utils'

export class MidjourneyApi extends MidjourneyCommand {
  constructor(public opts: MidJourneyFullOptions) {
    super(opts)
  }

  private interactions(payload: any, cb?: MessageCallBack) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.opts.token,
    }
    return this.opts
      .fetch(`${this.opts.apiBaseUrl}/api/v9/interactions`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers,
      })
      .then(res =>
        res.ok
          ? cb?.('REQUEST_SUCCESS', res as any)
          : cb?.('REQUEST_FAILED', res as any),
      )
      .catch(err => cb?.('REQUEST_FAILED', err))
  }

  private getPayload(
    type: number,
    data: any,
    others: any = {},
    nonce = nextNonce(),
  ) {
    if (!this.opts.session_id)
      throw new Error('please invoke `init` method before every operate')

    return Object.assign(
      {
        type,
        application_id: '936929561302675456',
        guild_id: this.opts.guild_id,
        channel_id: this.opts.channel_id,
        session_id: this.opts.session_id,
        nonce,
        data,
      },
      others,
    )
  }

  private inpaint(
    customId: string,
    prompt: string,
    mask: string,
    cb?: MessageCallBack,
  ) {
    const headers = {
      'Content-Type': 'application/json',
    }
    return this.opts
      .fetch(`${this.opts.discordsaysUrl}/inpaint/api/submit-job`, {
        method: 'POST',
        body: JSON.stringify({
          customId,
          prompt,
          mask: mask.replace(/^data:.+?;base64,/, ''),
          userId: '0',
          username: '0',
          full_prompt: null,
        }),
        headers,
      })
      .then(res =>
        res.ok
          ? cb?.('REQUEST_SUCCESS', res as any)
          : cb?.('REQUEST_FAILED', res as any),
      )
      .catch(err => cb?.('REQUEST_FAILED', err))
  }

  async imagine(value: string, cb?: MessageCallBack) {
    return this.getCommand('imagine').then((command) => {
      const payload = this.getPayload(
        2,
        Object.assign(command!, {
          options: [{ ...command?.options[0], value }],
        }),
      )
      return Promise.all([
        this.interactions(payload, cb),
        this.opts.ws?.waitMessage({ nonce: payload.nonce, cb }),
      ]).then(([_, res]) => res)
    })
  }

  action(
    message_id: string,
    custom_id: string,
    message_flags: number,
    cb?: MessageCallBack,
  ) {
    const payload = this.getPayload(
      3,
      {
        component_type: 2,
        custom_id,
      },
      {
        message_flags,
        message_id,
      },
    )
    return Promise.all([
      this.interactions(payload, cb),
      this.opts.ws?.waitMessage({
        nonce: payload.nonce,
        cb,
        parentId: message_id,
      }),
    ]).then(([_, res]) => res)
  }

  remixSubmit(
    id: string,
    custom_id: string,
    components: MjOriginMessage['components'],
    cb?: MessageCallBack,
  ) {
    const payload = this.getPayload(5, {
      id,
      custom_id,
      components,
    })
    return Promise.all([
      this.interactions(payload, cb),
      this.opts.ws?.waitMessage({
        nonce: payload.nonce,
        cb,
      }),
    ]).then(([_, res]) => res)
  }

  varyRegion(
    customId: string,
    prompt: string,
    mask: string,
    cb?: MessageCallBack,
  ) {
    const nonce = nextNonce()
    return Promise.all([
      this.inpaint(customId, `regionNonce: ${nonce}, ${prompt}`, mask, cb),
      this.opts.ws?.waitMessage({ nonce, cb }),
    ]).then(([_, msg]) => msg)
  }

  info(cb?: MessageCallBack) {
    return this.getCommand('info').then((command) => {
      const payload = this.getPayload(2, command)
      return Promise.all([
        this.interactions(payload, cb),
        this.opts.ws?.waitMessage({ nonce: payload.nonce, cb }),
      ]).then(([_, msg]) => msg)
    })
  }

  settings(cb?: MessageCallBack) {
    return this.getCommand('settings').then((command) => {
      const payload = this.getPayload(2, command)
      return Promise.all([
        this.interactions(payload, cb),
        this.opts.ws?.waitMessage({ nonce: payload.nonce, cb }),
      ]).then(([_, msg]) => msg)
    })
  }

  fast(cb?: MessageCallBack) {
    return this.getCommand('fast').then((command) => {
      const payload = this.getPayload(2, command)
      return Promise.all([
        this.interactions(payload, cb),
        this.opts.ws?.waitMessage({ nonce: payload.nonce, cb }),
      ]).then(([_, msg]) => msg)
    })
  }

  relax(cb?: MessageCallBack) {
    return this.getCommand('relax').then((command) => {
      const payload = this.getPayload(2, command)
      return Promise.all([
        this.interactions(payload, cb),
        this.opts.ws?.waitMessage({ nonce: payload.nonce, cb }),
      ]).then(([_, msg]) => msg)
    })
  }
}
