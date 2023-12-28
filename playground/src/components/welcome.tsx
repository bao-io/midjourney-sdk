import { MessageContent } from '@/content/message'
import { useMjStore } from '@/stores/mj'
import { Button } from 'antd'
import { useContext } from 'react'

export default function Welcome() {
  const [ins, handleMsg] = useMjStore((state) => [state.ins, state.handleMsg])
  const ctx = useContext(MessageContent)
  return (
    <div className="flex flex-col gap-5 items-center py-5">
      <img src="/mj.png" className="w-16 h-16 rounded-full" />
      <h1 className="text-center text-2xl font-bold">Midjourney-SDK Example</h1>
      <a
        href="https://github.com/LaiBaoYuan/midjourney-sdk"
        className="text-center underline block !text-white"
        target="_blank"
      >
        It's useful for you, please give me open source power and support star
        in my `midjourney-sdk` repo.
      </a>
      {ins?.initialize && (
        <div className="flex items-center gap-2 justify-center">
          <Button
            type="primary"
            onClick={() => {
              ctx?.setJobLoading(true)
              ins?.api.settings((type, msg) =>
                handleMsg(type, msg, ctx?.handJobMsg)
              )
            }}
          >
            /settings
          </Button>
          <Button
            type="primary"
            onClick={() => {
              ctx?.setJobLoading(true)
              ins?.api.info((type, msg) =>
                handleMsg(type, msg, ctx?.handJobMsg)
              )
            }}
          >
            /info
          </Button>
        </div>
      )}
    </div>
  )
}
