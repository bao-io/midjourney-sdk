import { useContext, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Send from '@/icons/send.svg'
import { useMjStore } from '@/stores/mj'
import { MessageContent } from '@/content/message'

export default function Footer() {
  const [input, setInput] = useState('')
  const [ins, handleMsg] = useMjStore((state) => [state.ins, state.handleMsg])
  const ctx = useContext(MessageContent)
  return (
    <div className="fixed bottom-0 inset-x-0 p-2 bg-transparent">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) ctx?.ins.warning('prompt is empty')
          ctx?.setJobLoading(true)
          ins?.api.imagine(input, (type, msg) =>
            handleMsg(type, msg, ctx?.handJobMsg)
          )
          setInput('')
        }}
        className="flex items-center p-2 rounded-lg bg-gray-600 -top-3 relative"
      >
        <TextareaAutosize
          value={input}
          rows={1}
          placeholder="send an image prompt"
          className="flex-1 p-1 resize-none bg-transparent outline-none overflow-hidden border-none focus:ring-0"
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="border-l border-gray-500 text-sm h-6 px-2 disabled:text-gray-400"
          disabled={!!!input}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
