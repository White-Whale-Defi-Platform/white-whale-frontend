
export const base64ToJson = (base64String: string) => JSON.parse(Buffer.from(base64String, 'base64').toString('utf-8'))
