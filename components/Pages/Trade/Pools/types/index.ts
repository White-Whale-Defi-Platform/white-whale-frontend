import React from 'react'

import { FlowData } from 'components/Pages/Trade/Incentivize/hooks/useIncentivePoolInfo'

export type Pool = {
  poolId: string
  contract: string
  pool: string
  token1Img: string
  token2Img: string
  myPosition?: number | string
  apr: number | string
  volume24hr: number | string
  totalLiq: number | string
  price?: number
  cta?: () => void
  incentives: React.ReactNode
  flows: FlowData[]
  myIncentiveApr: string
  action: React.ReactNode
}
