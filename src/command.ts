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
      return this.opts
        .fetch(
          `${this.opts.apiBaseUrl}/api/v9/guilds/${this.opts.guild_id}/application-command-index`,
          {
            headers: { authorization: this.opts.token },
          },
        )
        .then(res => res.json())
        .then(({ application_commands }) => {
          const detail = (application_commands as any[]).find(v => v.name === query)
          if (detail) {
            this.commandCaches[query] = detail
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
