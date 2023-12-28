import { MjPaper, ce } from '@/utils/paper'
import TextareaAutosize from 'react-textarea-autosize'
import Undo from '@/icons/undo.svg'
import Send from '@/icons/send.svg'
import Rect from '@/icons/rect.svg'
import Lasso from '@/icons/lasso.svg'
import { useContext, useEffect, useRef, useState } from 'react'
import { useMjStore } from '@/stores/mj'
import clsx from 'clsx'
import { MessageContent } from '@/content/message'

export default function InpaintingEditor({
  submit
}: {
  submit: (mask: string, prompt: string) => void
}) {
  const [paper, setPaper] = useState<MjPaper | null>(null)
  const [selectedTool, setTool] = useState<0 | 0.5>(0)
  const canvas = useRef<HTMLCanvasElement>(null)
  const varyRegionInfo = useMjStore((state) => state.varyRegionInfo)
  const [input, setInput] = useState(varyRegionInfo.varyRegionPrompt)
  const ctx = useContext(MessageContent)
  const btns = [
    { label: 'rect', value: 0, icon: Rect },
    { label: 'lasso', value: 0.5, icon: Lasso }
  ] as const
  const getImg = () =>
    new Promise<HTMLImageElement>((s) => {
      const img = new Image()
      img.src = varyRegionInfo.varyRegionImgBase64
      img.onload = () => s(img)
    })
  const init = async () => {
    if (canvas.current) {
      const img = await getImg()
      const paper = new MjPaper(canvas.current, img)
      setPaper(paper)
    }
  }
  const handleSubmit = () => {
    if (!input.trim()) {
      ctx?.ins.error('image prompt is required')
      return
    }
    ctx?.setJobLoading(true)
    paper
      ?.submit()
      .then((mask) => submit(mask, input))
      .catch((errMsg) => ctx?.ins.error(errMsg))
  }
  useEffect(() => {
    init()
    return () => (ce as any).clear()
  }, [])
  return (
    <>
      <div className="flex-1 flex items-center justify-center absolute inset-0 h-full">
        <canvas
          //@ts-ignore
          hidpi="on"
          ref={canvas}
          width="1024"
          height="1024"
          resize="true"
          style={{
            padding: '0px',
            margin: '0px',
            width: '100%',
            maxWidth: '960px'
          }}
        ></canvas>
      </div>
      <div className="fixed top-20 left-3 flex justify-center items-center">
        <button className="editor-btn border" onClick={() => paper?.undo()}>
          <Undo className="w-5 h-5" />
        </button>
      </div>
      <div
        id="appbody"
        className="flex fixed inset-x-0 bottom-0 w-full items-end justify-between p-3 border gap-4"
      >
        <div className="flex gap-2">
          {btns.map((v, i) => (
            <button
              key={i}
              className={clsx(
                'editor-btn',
                selectedTool === v.value && '!bg-gray-400'
              )}
              onClick={() => {
                paper &&
                  setPaper((paper) =>
                    Object.assign(paper!, { selectedTool: v.value })
                  )
                setTool(v.value)
              }}
            >
              <v.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="flex items-end flex-1 gap-4">
          <TextareaAutosize
            value={input}
            rows={1}
            className="resize-none overflow-hidden flex-1 !border-gray-200 rounded"
            placeholder="send a prompt"
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="editor-btn flex-shrink-0" onClick={handleSubmit}>
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}
