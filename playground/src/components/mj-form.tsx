import { MidJourneyOptions, defaultOpts } from 'midjourney-sdk'
import { forwardRef, useContext, useState } from 'react'
import { useMjStore } from '@/stores/mj'
import { Button, Form, FormInstance, Input } from 'antd'
import { MessageContent } from '@/content/message'

export const MjLoginForm = () => {
  const init = useMjStore((state) => state.init)
  const [loading, setLoading] = useState(false)
  const ctx = useContext(MessageContent)
  return (
    <Form<MidJourneyOptions>
      className="w-full max-w-[600px] !m-auto !p-5"
      rootClassName="mj-form"
      layout="vertical"
      initialValues={{
        token: process.env.NEXT_PUBLIC_TOKEN as string,
        guild_id: process.env.NEXT_PUBLIC_GUILD_ID as string,
        channel_id: process.env.NEXT_PUBLIC_CHANNEL_ID as string,
        apiBaseUrl:
          (process.env.NEXT_PUBLIC_API_BASE_URL as string) ||
          defaultOpts.apiBaseUrl,
        wsBaseUrl:
          (process.env.NEXT_PUBLIC_WS_BASE_URL as string) ||
          defaultOpts.wsBaseUrl,
        imgBaseUrl:
          (process.env.NEXT_PUBLIC_IMG_BASE_URL as string) ||
          defaultOpts.imgBaseUrl
      }}
      onFinish={(form) => {
        setLoading(true)
        return init(form)
          .catch((err) => ctx?.ins.error(err.message))
          .finally(() => setLoading(false))
      }}
    >
      <Form.Item
        label="Guild's Id"
        name="guild_id"
        rules={[{ required: true, message: 'Please input your guildId!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Channel's Id"
        name="channel_id"
        rules={[{ required: true, message: 'Please input your channelId!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Token"
        name="token"
        rules={[{ required: true, message: 'Please input your token!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="DiscordApi's BaseUrl" name="apiBaseUrl">
        <Input />
      </Form.Item>
      <Form.Item label="DiscordWs's BaseUrl" name="wsBaseUrl">
        <Input />
      </Form.Item>
      <Form.Item label="DiscordImage's BaseApi" name="imgBaseUrl">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full"
          loading={loading}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export const MjRemixForm = forwardRef<FormInstance>(({}, formRef) => {
  const components = useMjStore((state) => state.remixSubmitInfo.components)
  return (
    <Form
      layout="vertical"
      ref={formRef}
      initialValues={{ prompt: components.at(0)?.components.at(0).value }}
    >
      <Form.Item
        label="NEW PROMPT FOR IMAGE"
        name="prompt"
        rules={[
          {
            required: true,
            message: 'Please enter the image prompt!'
          }
        ]}
      >
        <Input.TextArea
          placeholder="enter a new prompt"
          rows={5}
          showCount
          maxLength={4000}
        ></Input.TextArea>
      </Form.Item>
    </Form>
  )
})
