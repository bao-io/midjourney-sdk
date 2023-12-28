import type { ApplicationCommond, MidJourneyFullOptions } from './types'

export const Commands = [
  'ask',
  'blend',
  'describe',
  'fast',
  'help',
  'imagine',
  'info',
  'prefer',
  'private',
  'public',
  'relax',
  'settings',
  'show',
  'stealth',
  'shorten',
  'subscribe',
] as const

export type CommandName = (typeof Commands)[number]

export class MidjourneyCommand {
  constructor(public opts: MidJourneyFullOptions) {}
  private commandCaches: Partial<Record<CommandName, ApplicationCommond>> = {}

  getCommand(query: CommandName) {
    if (!this.commandCaches[query]) {
      const searchParams = new URLSearchParams({
        type: '1',
        query,
        limit: '1',
        include_applications: 'false',
      })
      return this.opts
        .fetch(
          `${this.opts.apiBaseUrl}/api/v9/channels/${this.opts.channel_id}/application-commands/search?${searchParams}`,
          {
            headers: { authorization: this.opts.token },
          },
        )
        .then(res => res.json())
        .then(({ application_commands }) => {
          if (application_commands.length) {
            this.commandCaches[query] = application_commands[0]
            return this.commandCaches[query]
          }
          else {
            return Promise.reject(new Error('command not found'))
          }
        })
    }
    return Promise.resolve(this.commandCaches[query])
  }
}
