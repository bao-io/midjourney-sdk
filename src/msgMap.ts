import type { MjMessage } from './types'

export class MidjourneyMsgMap extends Map<MjMessage['nonce'], MjMessage> {
  updateMsgByNonce(id: string, nonce: string) {
    const msg = this.get(nonce)
    if (!msg)
      return
    msg.id = id
  }

  getMsgById(id: string) {
    return Array.from(this.entries()).find(([_, v]) => v.id === id)?.[1]
  }

  getMsgByparentId(parentId: string) {
    return Array.from(this.entries()).find(
      ([_, v]) => v.parentId === parentId && v.progress !== 100,
    )?.[1]
  }

  getMsgByOriginId(originId: string) {
    return Array.from(this.entries()).find(
      ([_, v]) => v.originId === originId,
    )?.[1]
  }

  getMsgByContent(content: string) {
    const RE = /\*\*(.+?)\*\*/
    const match = content?.match(RE)
    return Array.from(this.entries()).find(
      ([_, v]) =>
        match && match[1] === v.content?.match(RE)?.[1] && v.progress !== 100,
    )?.[1]
  }

  getVaryMsgByContent(content: string) {
    const RE = /\*\*regionNonce:\s(\d+?),\s/
    const regionNonce = content?.match(RE)?.[1]
    return this.get(regionNonce)
  }
}
