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
  isUSDPool?: boolean
  isSubqueryNetwork?: boolean
  cta?: () => void,
  incentives: React.ReactNode
  action: React.ReactNode
}
