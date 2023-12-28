import { MjLoginForm, MjRemixForm } from '@/components/mj-form'
import Welcome from '@/components/welcome'
import { useMjStore } from '@/stores/mj'
import Footer from '@/components/footer'
import MsgItem from '@/components/msg-item'
import MjModal from '@/components/mj-modal'
import InpaintingEditor from '@/components/inpainting-editor'
import { MessageContent } from '@/content/message'
import { useContext, useRef } from 'react'
import { Spin, Modal, FormInstance } from 'antd'
import { useHydrated } from '@/hooks'

export default function Home() {
  const [
    ins,
    mapping,
    openVaryRegion,
    openRemixModal,
    setOpenVaryRegion,
    setOpenRemixModal,
    varyRegionInfo,
    remixSubmitInfo,
    handleMsg
  ] = useMjStore((state) => [
    state.ins,
    state.mapping,
    state.openVaryRegion,
    state.openRemixModal,
    state.setOpenVaryRegion,
    state.setOpenRemixModal,
    state.varyRegionInfo,
    state.remixSubmitInfo,
    state.handleMsg
  ])
  const ctx = useContext(MessageContent)
  const hy = useHydrated()
  const formRef = useRef<FormInstance>(null)
  const handleSubmit = (mask: string, prompt: string) => {
    if (ins && varyRegionInfo.varyRegionCustomId && mask && prompt) {
      ctx?.setJobLoading(true)
      ins.api.varyRegion(
        varyRegionInfo.varyRegionCustomId,
        prompt,
        mask,
        (type, msg) => handleMsg(type, msg, ctx?.handJobMsg)
      )
      setOpenVaryRegion(false)
    }
  }
  return (
    <Spin
      size="large"
      spinning={ctx?.jobLoading}
      tip="job executing..."
      className="!max-h-none"
      wrapperClassName="h-full"
    >
      <div className="pb-[10vh] bg-gray-950/80 text-white h-full w-full relative overflow-auto">
        {hy && (
          <>
            <Welcome />
            {!ins?.initialize ? (
              <MjLoginForm />
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {Object.entries(mapping).map(([k, v]) => (
                    <MsgItem key={k} item={v} />
                  ))}
                </div>
                <Footer />
              </>
            )}
            <MjModal
              show={openVaryRegion}
              setOpen={setOpenVaryRegion}
              title="Vary（Region）"
              fullscreen
            >
              <InpaintingEditor submit={handleSubmit} />
            </MjModal>
            <Modal
              title="Remix Prompt"
              open={openRemixModal}
              destroyOnClose
              onCancel={() => setOpenRemixModal(false)}
              onOk={() => {
                formRef.current?.validateFields().then(({ prompt }) => {
                  ctx?.setJobLoading(true)
                  let components = remixSubmitInfo.components
                  components.at(0)!.components.at(0).value = prompt
                  ins?.api.remixSubmit(
                    remixSubmitInfo.id,
                    remixSubmitInfo.custom_id,
                    components,
                    (type, msg) => handleMsg(type, msg, ctx?.handJobMsg)
                  )
                  setOpenRemixModal(false)
                })
              }}
            >
              <MjRemixForm ref={formRef} />
            </Modal>
          </>
        )}
      </div>
    </Spin>
  )
}
