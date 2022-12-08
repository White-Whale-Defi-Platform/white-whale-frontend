export type Pool = {
  contract: string
  pool: string
  token1Img: string
  token2Img: string
  myPosition?: number | string
  apr: number | string
  volume24hr: number | string
  totalLiq: number | string
  price?: number
  isUSDCPool?: boolean
  cta?: () => void
}
