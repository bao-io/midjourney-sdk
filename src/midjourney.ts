import { MidjourneyApi } from './api'
import { defaultOpts } from './config'
import type { MidJourneyFullOptions, MidJourneyOptions } from './types'
import { MidjourneyWs } from './ws'

export class MidJourney {
  api: MidjourneyApi
  private opts: MidJourneyFullOptions
  constructor(opts: MidJourneyOptions) {
    if (!opts.token || !opts.channel_id || !opts.guild_id)
      throw new Error('`token`、`channel_id` and `guild_id` are required')

    this.opts = Object.assign({}, defaultOpts, opts) as MidJourneyFullOptions
    if (!this.opts.apiBaseUrl)
      this.opts.apiBaseUrl = defaultOpts.apiBaseUrl
    if (!this.opts.wsBaseUrl)
      this.opts.wsBaseUrl = defaultOpts.wsBaseUrl
    if (!this.opts.imgBaseUrl)
      this.opts.imgBaseUrl = defaultOpts.imgBaseUrl
    this.api = new MidjourneyApi(this.opts)
  }

  async init() {
    this.opts.ws = new MidjourneyWs(this.opts)
    await this.opts.ws.waitReady()
    return this
  }

  get initialize() {
    return this.opts.ws?.wsClient.readyState === 1
  }

  get user() {
    return this.opts.user
  }
}
