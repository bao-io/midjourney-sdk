import { useMjStore } from '@/stores/mj'
import { message } from 'antd'
import { MessageInstance } from 'antd/es/message/interface'
import { MjMsgType } from 'midjourney-sdk'
import React, { createContext, useState } from 'react'

export const MessageContent = createContext<{
  jobLoading: boolean
  ins: MessageInstance
  handJobMsg: (type: MjMsgType) => void
  setJobLoading: (val: boolean) => void
} | null>(null)

export const MessageProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [jobLoading, setJobLoading] = useState(false)
  return (
    <MessageContent.Provider
      value={{
        jobLoading,
        setJobLoading,
        ins: messageApi,
        handJobMsg(type) {
          if (type === 'REQUEST_SUCCESS')
            messageApi?.success('job execute success!')
          else if (type === 'REQUEST_FAILED')
            messageApi?.error('job execute failed!')
          setJobLoading(false)
        }
      }}
    >
      {contextHolder}
      {children}
    </MessageContent.Provider>
  )
}
