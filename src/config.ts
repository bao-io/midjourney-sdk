import fetch from 'isomorphic-fetch'
import { debug } from './utils'

export const defaultOpts = {
  apiBaseUrl: 'https://discord.com',
  wsBaseUrl: 'wss://gateway.discord.gg/?encoding=json&v=9',
  imgBaseUrl: 'https://cdn.discordapp.com',
  debug,
  fetch,
  skipHeartbeat: false,
  discordsaysUrl:
    typeof document === 'undefined'
      ? 'https://936929561302675456.discordsays.com'
      : '',
}
