export const jsonToBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export const base64ToJson = (base64String: string) => {
  return JSON.parse(Buffer.from(base64String, 'base64').toString('utf-8'))
}
