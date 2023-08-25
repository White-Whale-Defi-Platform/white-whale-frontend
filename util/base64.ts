import { EncodeObject } from '@cosmjs/proto-signing'

export const jsonToBase64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64')

export const base64ToJson = (base64String: string) => JSON.parse(Buffer.from(base64String, 'base64').toString('utf-8'))

export const decodeMsgs = (msgs: EncodeObject[] = []) => [...msgs].map((msg) => {
  const value = { ...msg.value }
  value.msg = JSON.parse(Buffer.from(value.msg, 'base64').toString('utf-8'))
  return {
    ...msg,
    value,
  }
})
